import { PlaywrightCrawlingContext } from "crawlee"
import { v4 as uuidv4 } from 'uuid'
import { ordersClientRedis } from "../../clients/redis.js"

type HeadsTable =
  'Item' |
  'UN' |
  'Quant Anterior' |
  'Quant Entrada' |
  'Valor NF' |
  'IPI' |
  'ICMS ST' |
  'Custo Inicial' |
  'Frete + Outros' |
  'Custo Frete' |
  'Crédito ICMS' |
  'Custo Final' |
  'Total Custo' |
  'Preço Venda' |
  'Imposto Saída' |
  '% Margem' |
  'Markup'

type KeysSchema =
  'productDescription' |
  'productSku' |
  'productSupplierCode' |
  'productSupplierDescription' |
  'stockUnit' |
  'previousQuantity' |
  'arrivalQuantity' |
  'nfValue' |
  'ipi' |
  'icmsSt' |
  'initialCost' |
  'freight' |
  'freightCost' |
  'icmsCredit' |
  'finalCost' |
  'salePrice' |
  'exitTax' |
  'margin' |
  'markup'

  const headsToKeys: Record<HeadsTable, KeysSchema> = {
    "% Margem": 'margin',
    "Crédito ICMS": 'icmsCredit',
    "Custo Final": 'finalCost',
    "Custo Frete": 'freightCost',
    "Custo Inicial": 'initialCost',
    "Frete + Outros": 'freight',
    "ICMS ST": 'icmsSt',
    "Imposto Saída": 'exitTax',
    "Preço Venda": 'salePrice',
    "Quant Anterior": 'previousQuantity',
    "Quant Entrada": 'arrivalQuantity',
    "Total Custo": 'finalCost',
    "Valor NF": 'nfValue',
    IPI: 'ipi',
    Item: 'productDescription',
    Markup: 'markup',
    UN: 'stockUnit'
  }

export const parseEntryNf = async (ctx: PlaywrightCrawlingContext) => {
  const { crawler, request: { userData } } = ctx
  const productsAll = await captureProductsInNf(ctx)
  const products = [...productsAll.values()].map(p => Object.fromEntries(p))

  const oClient = await ordersClientRedis.connect()
  await oClient.set(userData.data.order, JSON.stringify({ products, createdAt: new Date() }))
  await oClient.disconnect()

  userData.data.products = [...productsAll.keys()]
  userData.route = '1700'
  userData.action = 'suggest'

  await crawler.addRequests([
    {
      url: 'https://srv1.meuewiki.com.br/mgerencia/#index/index',
      label: 'inicial',
      userData,
      uniqueKey: uuidv4(),
    }
  ], {
    waitForAllRequestsToBeAdded: true
  })
} 

async function captureProductsInNf({ request, page }: PlaywrightCrawlingContext) {
  const { userData } = request
  const menu = page.locator('div.fw_content div#main div#windowcotacoes div.blockContent div.programContent div.header nav.menu')
  await menu.waitFor({ state: 'attached' })
  await menu.getByText(/Entradas de Mercadoria/).click()

  const entryPageSearch = page.locator('div.fastsearchContainerSearch')
  await entryPageSearch.waitFor({state: 'attached'})
  
  await page.locator('div.fastsearch_areaData').click()
  const startDate = page.locator('div.smart-form input.dtPeriodoInicio')
  await startDate.fill('')
  await startDate.fill('01012023')

  // INSERIR MAIS OPÇOES DE PREENCHIMENTO DE DATA
  
  await entryPageSearch.click()

  const modalSearch = page.locator('div.modalFastSearch div.modal-content div.modal-body')
  await modalSearch.waitFor({ state: 'attached' })
  await modalSearch.getByPlaceholder('Digite aqui a sua pesquisa').fill(userData.data.order)
  await modalSearch.press('Enter')

  // INSERIR TRATAMENTO DE ERRO CASO NÃO HAJA UMA NOTA COM ESSE NUMERO DISPONIVEL

  const table = page.locator('div.dataTables_scroll tbody')
  await table.waitFor({ state: 'attached' })
  await table.locator('tr').first().click()

  const titlePage = page.locator('div.modal-content').getByText(/^Produtos$/)
  await titlePage.waitFor({ state: 'attached' })
  
  const modalNf = page.locator('div.modal-content').filter({ hasText: /Produtos/ })
  const tables = await modalNf.locator('table').all()
  const headTable = await tables[2].locator('thead tr td').all()
  const headText = headTable.map(async field => (await field.textContent())?.trim())
  const rows = await tables[2].locator('tbody tr').all()

  const heads = (await Promise.all(headText)) as HeadsTable[]

  const products = new Map<string, Map<KeysSchema, string>>()

  await Promise.all(rows.map(async (row) => {
    const values = new Map<KeysSchema, string>()
    const allCells = await row.locator('td').all()
    const htmlCellProduct = await allCells[1].innerHTML()
    const { 
      sku,
      description,
      supplierCod,
      supplierDescription
    } = /<strong>(?<supplierCod>.*?)(\s-\s)(?<supplierDescription>.*?)<\/strong><br>(?<sku>.*?)(\s-\s)(?<description>.*)/.exec(htmlCellProduct)
      ?.groups as { sku: string,
                    description: string,
                    supplierCod: string,
                    supplierDescription: string
                  }
    
    const data = await row.locator('td').allTextContents()

    data.forEach((value, index) => {      
      const existKey = headsToKeys[heads[index]]

      if (existKey) {
        existKey === 'productDescription' ? values.set('productDescription', description) : values.set(existKey, value)
      }
    })

    if (products.has(sku)) {
      const prevProduct = products.get(sku)!
      values.set('arrivalQuantity', String(Number(values.get('arrivalQuantity')) + Number(prevProduct.get('arrivalQuantity'))))
    }

    values.set('productSku', sku)
    values.set('productSupplierCode', supplierCod)
    values.set('productSupplierDescription', supplierDescription)

    products.set(sku, values)
  }))

  return products
}

