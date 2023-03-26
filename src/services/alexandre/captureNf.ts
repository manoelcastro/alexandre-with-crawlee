import { PlaywrightCrawlingContext } from 'crawlee'
import path from 'path'

export const captureNf = async ({ page, request }: PlaywrightCrawlingContext) => {
  const { userData } = request

  const order = userData.data.order
  await page.waitForLoadState(`load`)

  const openSearchFields = page.locator('.fastsearchContainerSearch')
  
  await openSearchFields.click()

  await page.locator('input[name=idVenda]').fill(order)
  await page.press('input[name=idVenda]', 'Enter')

  const resultOfSearch = page.locator('tbody > tr > td')

  const firstResult = await resultOfSearch.first().textContent()

  if (firstResult === 'Nenhum registro encontrado') {
    console.log('nada encontrado')
    return
  }

  const numberNFField = resultOfSearch.nth(5)
  const numberNf = await numberNFField.textContent()
  
  if (numberNf === '') {
    console.log('Nao existe link')
    return
  }
  const typeNF = await resultOfSearch.nth(4).textContent()

  const downloadForcePDFPromise = page.waitForEvent('download')
  await numberNFField.click()
  await page.waitForURL('**\/ver_assistente\/**')
  const downloadPDF = await downloadForcePDFPromise
  const namePDFFile = `${typeNF}_${numberNf}.${downloadPDF.suggestedFilename().split('.').at(-1)}`
  const pathDownloadPDF = path.join(process.cwd(), 'storage', 'downloads', order, namePDFFile)
  await downloadPDF.saveAs(pathDownloadPDF)

  const downloadZIPPromise = page.waitForEvent('download')
  const downloadZipButton = page.getByRole('link', { name: 'Download XML'})
  await downloadZipButton.click()
  const downloadZip = await downloadZIPPromise
  const nameZIPFile = `${typeNF}_${numberNf}.${downloadZip.suggestedFilename().split('.').at(-1)}`
  const pathDownloadZIP = path.join(process.cwd(), 'storage', 'downloads', order, nameZIPFile)
  await downloadZip.saveAs(pathDownloadZIP)
}
