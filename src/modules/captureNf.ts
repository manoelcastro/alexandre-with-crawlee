import {PlaywrightCrawlingContext} from 'crawlee'
import path from 'path'

interface ICaptureNfDTO {
  order?: string
  numberNf?: string
}

export default async ({ order, numberNf }: ICaptureNfDTO) => {
  return async ({ page }: PlaywrightCrawlingContext) => {
    await page.waitForLoadState(`load`)
  
    const openSearchContainer = page.locator('.fastsearchContainerSearch')
    await openSearchContainer.click()
    if (order) {
      await page.locator('input[name=idVenda]').fill(order)
      await page.press('input[name=idVenda]', 'Enter')
    } else if (numberNf) {
      return
    }
    
    const resultTable = page.locator('tbody > tr')
    
    const firstResult = await resultTable.first().textContent()
    
    if (firstResult === 'Nenhum registro encontrado') {
      console.log('nada encontrado')
      return
    }
    
    const numberNFField = resultTable.nth(5)
    await numberNFField.textContent()
    
    if (await numberNFField.textContent() === '') {
      console.log('Nao existe link')
      return
    }
    
    await numberNFField.click()
    const downloadPromise = page.waitForEvent('download')
    await page.waitForURL('**\/ver_assistente\/**')
    const download = await downloadPromise
    if (order) {

      const pathDownload = path.join(process.cwd(), 'storage', 'downloads', order, download.suggestedFilename())
      await download.saveAs(pathDownload)
      
      //console.log(pathDownload)
      const downloadButton = page.getByRole('link', { name: 'Download XML'})
      console.log(await downloadButton.textContent(), await downloadButton.isVisible())
      const downloadPromise2 = page.waitForEvent('download')
      await downloadButton.click()
      const download2 = await downloadPromise2
      
      const pathDownload2 = path.join(process.cwd(), 'storage', 'downloads', order, download2.suggestedFilename())
      console.log(pathDownload2)
      await download2.saveAs(pathDownload2)
    }
  }
}