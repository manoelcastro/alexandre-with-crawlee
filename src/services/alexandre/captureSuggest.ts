import { PlaywrightCrawlingContext } from "crawlee"
import { ordersClientRedis, productsClientRedis } from "../../../src/clients/redis.js"

interface ProductInfo {
  branch: string,
  stock: string,
  order: string,
  idealStock: string,
  suggestion: string,
  lastPurchase: string,
  quantityPurchase: string,
  purchasedValue: string,
  averageCost: string,
  saleValue: string,
  margin: string,
  transfer90Days: string,
  adjusts: string,
  sales8Months: string,
  salesSet: string,
  salesOut: string,
  salesNov: string,
  salesDez: string,
  averageSale: string,
  averageTurnover: string,
  minStock: string,
  potential: string
}

interface Product {
  sku: string,
  info: ProductInfo
}

type HeadsTable = 'Filial'|
'Estoque' |
'Pedido' |
"Est. Ideal" |
"Sugestão" |
"Ultima Compra" |
"Quant Comprado" |
"Valor Compra" |
"Custo Médio" |
"ValorVenda" |
"Margem%" |
"Transf (90d)" |
"Ajustes (90d)" |
"ANTERIOR (8 meses)" |
"Média 3 meses" |
"Giro Médio Dia" |
"Minimo" |
"Potencial"

type KeysSchema = 'branch' |
'stock' |
'order' |
'idealStock' |
'suggestion' |
'lastPurchase' |
'purchaseQuantity' |
'purchasedValue' |
'averageCost' |
'saleValue' |
'margin' |
'transfer90Days' |
'adjusts' |
'sales8Months' |
'averageSale' |
'averageTurnover' |
'minStock' |
'potential'

const headsToKeys: Record<HeadsTable, KeysSchema> = {
  "Ajustes (90d)": 'adjusts',
  "ANTERIOR (8 meses)": 'sales8Months',
  "Custo Médio": 'averageCost',
  "Est. Ideal": 'idealStock',
  "Giro Médio Dia": 'averageTurnover',
  "Margem%": 'margin',
  "Média 3 meses": 'averageSale',
  "Quant Comprado": 'purchaseQuantity',
  "Transf (90d)": 'transfer90Days',
  "Ultima Compra": 'lastPurchase',
  "Valor Compra": 'purchasedValue',
  Estoque: 'stock',
  Filial: 'branch',
  Minimo: 'minStock',
  Pedido: 'order',
  Potencial: 'potential',
  Sugestão: 'suggestion',
  ValorVenda: 'saleValue'
}

export const captureSuggest = async (ctx: PlaywrightCrawlingContext) => {
  const { request: { userData: { data: { products, order } } }, page } = ctx
   
  const listaDeProdutos = page.locator('a.site-tab').getByText('Lista de Produtos')
  await listaDeProdutos.click()

  await page.waitForLoadState('load')

  const productsCrawled = []
  let productsToCraw

  if (!order) {
    productsToCraw = products
  } else {
    const oClient = await ordersClientRedis.connect()
    const orderCrawled = JSON.parse((await oClient.get(order))!)
    await oClient.disconnect()
    
    productsToCraw = orderCrawled.products.map(prod => prod.productSku)
  }
  
  for (let index = 0; index < productsToCraw.length; index++) {
    const openSearchFields = page.locator('.fastsearchContainerSearch')  
    await openSearchFields.click()

    if (index === 0) {
      const filialField = page.locator('.modal-body button.multiselect')
      await filialField.click()
      
      const titleFiliais = await filialField.getAttribute('title')
      const selectedFiliais = titleFiliais?.split(',').map(s => s.trim())
      
      const filiaisToClick = selectedFiliais?.map(name => page.locator('.modal-body ul.multiselect-container li', { hasText: name }))
      
      if (filiaisToClick) {
        for (const filial of filiaisToClick) {
          await filial.click()
        }
      }
      
      const simpleShowDiv = page.locator('.modal-body .row div', { hasText: 'Exibição Simplificada' })
      
      const noOption = simpleShowDiv.locator('label', { hasText: 'Não' })
      await noOption.click()
      
      await page.getByRole('dialog', {name: 'Filtros de Pesquisa'}).locator('select[name="tpModo"]').selectOption('sugestaodecompras') 
    }

    const codField = page.locator('.modal-body input[name=idProduto]')
    await codField.fill(String(productsToCraw[index]))

    const closeModal = page.locator('.modal-content .modal-header span.modal-btn-padrao button')
    await closeModal.click()

    const searchButton = page.locator('div.site-container div.site-pusher div.site-content div.fastsearch div.row button.fastsearch_button').first()
    await searchButton.click()

    const cellWithSKU = page.getByRole('gridcell', {name: productsToCraw[index], exact: true})
    await cellWithSKU.click()

    const cellSuggest = page.getByRole('gridcell', {name: 'Ultima Compra', exact: true})
    const tableSuggest = page.getByRole(`grid`).filter({ has: cellSuggest })

    await tableSuggest.waitFor({state: 'attached'})

    const all = await tableSuggest.getByRole('rowgroup').all()
    const head = all[0]
    const headsCell = await head.getByRole('gridcell').all()
    const titles: string[] = await Promise.all(headsCell.map(async c => (await c.textContent())?.trim()!))
    
    const bodyRows = (await page.locator('tbody tr').all()).slice(1)

    const info = await Promise.all(bodyRows.map(async row => {
      let values = new Map<KeysSchema, string>()

      const cellRow = await row.locator('td').all()

      await Promise.all(cellRow.map(async (cell, index) => {
        const text = (await cell.textContent())!
        const title = titles[index] as HeadsTable
        const newTitle = headsToKeys[title]
        
        newTitle && values.set(newTitle, text)         
        return
      }))

      return {
        branch: values.get('branch'),
        data: Object.fromEntries(values)
      }
    }))
    
    productsCrawled.push({ sku: productsToCraw[index], info})

    if (!order) {
      const pClient = await productsClientRedis.connect()
      await pClient.set(products[index], JSON.stringify(info))
      await pClient.disconnect()
    }
  }
  if (order) {
    const oClient = await ordersClientRedis.connect()
    const orderCrawled = JSON.parse((await oClient.get(order))!)
    const modifiedProducts = orderCrawled.products.map(p => ({
      ...p, info: productsCrawled.find(crawled => crawled.sku === p.productSku).info
    }))
    await oClient.set(order, JSON.stringify(modifiedProducts))
    await oClient.disconnect()
  }
}
