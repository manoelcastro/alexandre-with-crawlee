import { PlaywrightCrawlingContext } from "crawlee";
import path from 'path';

export const captureEstoque = async ({ request, page }: PlaywrightCrawlingContext) => {
  const { userData } = request
  
  const listaDeProdutos = page.locator('a.site-tab').getByText('Lista de Produtos')
  await listaDeProdutos.click()

  await page.waitForLoadState(`load`)

  const openSearchFields = page.locator('.fastsearchContainerSearch')
  
  await openSearchFields.click()

  const codField = page.locator('.modal-body input[name=idProduto]')
  await codField.type(userData.data.cod)

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

  const closeModal = page.locator('.modal-content .modal-header span.modal-btn-padrao button')
  await closeModal.click()

  const searchButton = page.locator('div.site-container div.site-pusher div.site-content div.fastsearch div.row button.fastsearch_button').first()
  await searchButton.click()
  
  const downloadCSVPromise = page.waitForEvent('download')

  const downloadCSVButton = page.locator('div.site-container div.site-pusher div.site-content div.internal-well div.dataTables_wrapper').getByRole('link', {name: 'CSV'})
  await downloadCSVButton.click()

  const downloadCSV = await downloadCSVPromise
  const nameCSVFile = `LISTADEPRODUTO_${userData.data.cod}.${downloadCSV.suggestedFilename().split('.').at(-1)}`
  const pathDownloadCSV = path.join(process.cwd(), 'storage', 'downloads', 'lista_de_produto', nameCSVFile)
  await downloadCSV.saveAs(pathDownloadCSV)
}