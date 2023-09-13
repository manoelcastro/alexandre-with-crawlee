import { PlaywrightCrawlingContext } from "crawlee";

export const captureEstoque = async ({ request, page }: PlaywrightCrawlingContext) => {
  const { userData } = request
  
  const listaDeProdutos = page.locator('a.site-tab').getByText('Lista de Produtos')
  await listaDeProdutos.click()

  console.log(userData)
  await page.waitForLoadState(`load`)

  const openSearchFields = page.locator('.fastsearchContainerSearch')
  
  await openSearchFields.click()

  const codField = page.locator('.modal-body input[name=idProduto]')
  await codField.type(userData.data.cod)

  const filialField = page.locator('.modal-body button.multiselect')
  await filialField.click()

  const titleFiliais = await filialField.getAttribute('title')
  const selectedFiliais = titleFiliais?.split(',').map(s => s.trim())

  const filiais = page.locator('.modal-body ul.multiselect-container li')
  
  selectedFiliais.
  titleFiliais && await filiais.getByText(titleFiliais).click()

  await page.waitForTimeout(10000)
}