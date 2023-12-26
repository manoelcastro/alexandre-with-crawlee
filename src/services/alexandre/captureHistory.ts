import { PlaywrightCrawlingContext } from "crawlee";
import path from 'path';

export const captureHistory = async ({ request, page }: PlaywrightCrawlingContext) => {
  const product = request.userData.data.cod

  console.log('Começando a puxar dados de ', product)
  
  try {
  const search = page.locator('.fastsearch div.fastsearchContainerSearch')
  await search.first().click()

  const modal = page.getByRole('dialog', { name: 'Filtros de Pesquisa' })
  await modal.locator('input[name=idProduto]').fill(product)

  const filialField = modal.locator('.smart-form', { hasText: 'Filial' }).locator('button.multiselect')
  await filialField.click()

  const titleFiliais = await filialField.getAttribute('title')
  const selectedFiliais = titleFiliais?.split(',').map(s => s.trim())

  const filiaisToClick = selectedFiliais?.map(name => page.locator('.modal-body ul.multiselect-container li', { hasText: name }))
  
  if (filiaisToClick) {
    for (const filial of filiaisToClick) {
      await filial.click()
    }
  }
  
  await modal.getByRole('button', { name: 'Close' }).click()
  await page.locator('.fastsearch_areaData').click()

  const today = new Date()
  const todayString = `${today.getDate()}${today.getMonth() + 1}${today.getFullYear()}`

  const startDate = page.locator('.fastsearch_containerDatePicker .internal-well .smart-form input.dtPeriodoInicio')
  await startDate.click()
  await startDate.type('01012017')
  
  const endDate = page.locator('.fastsearch_containerDatePicker .internal-well .smart-form input.dtPeriodoFim')
  await endDate.click()
  await endDate.type(todayString)

  await page.locator('.fastsearch button.fastsearch_button').first().click();
  
  try {
    await page.getByText(/Total registros: [.]*/).waitFor({ state: 'visible', timeout: 10000 })
    
    while (true) {
      const rows = await page.locator('.ff-idMovimentacao').all()
      const rowsText = await page.locator('.ff-idMovimentacao').allTextContents()
      console.log('texto quantidade', rows.length)
      
      const totalText = await page.getByText(/Total registros: [.]*/).textContent()
      const [, registers ] = totalText!.split(':')
      const total = parseInt(registers.replace(/[\.,]/, ''))
      
      if (total === rows.length && rowsText.every(text => text !== '')) break
    }
  } catch (e) {
    const empty = await page.getByRole('gridcell', { name: 'Nenhum registro encontrado' }).isVisible()
    
    if (empty) {
      console.log(`Nenhum registro encontrado para o produto ${product}`)
    } else {
      throw new Error('Não está vazio e não carregou')
    }
  }
    
  let productName = await page.locator('.internal-well header').textContent()
  
  productName = productName!.replace(/\//g, '|')
  productName = productName!.replace(/,/g, '.')

  const file = path.join('..','storage', 'downloads', 'history', `${productName}.csv`)

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('link', { name: 'CSV' }).click()
  ])
  
  await download.saveAs(file)
} catch {
  throw new Error(`Erro ao tentar capturar informações sobre o produto ${product}`)
}
}