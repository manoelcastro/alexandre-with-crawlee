import path from 'path'
import { Dataset, createPlaywrightRouter, RequestOptions, RequestQueue, Request, purgeDefaultStorages } from 'crawlee';

export const router = createPlaywrightRouter();

const routine = '1906'

router.addHandler('login', async ({ crawler, page}) => {
    const userField = page.getByPlaceholder('Usuário')
    const passField = page.getByPlaceholder('Senha')

    await userField.type('alexandre')
    await passField.type('alexandre')
    await passField.press('Enter')

    await page.waitForLoadState('load')
    
    await crawler.addRequests([{
        url: page.url(),
        label: 'inicial'    
    }])
});

router.addHandler('inicial', async ({page, crawler}) => {
  await page.waitForSelector('.fw_menu')

  const modal = page.locator('.fw_menu_container')

  const links = modal.locator('a')

  const queue = await links.evaluateAll(elements => {
    return elements.map(element => (element.textContent !== '' ? {
      label: element.textContent as string,
      url: `https://srv1.meuewiki.com.br/mgerencia/#${element.getAttribute('href')}`,
      uniqueKey: `https://srv1.meuewiki.com.br/mgerencia/#${element.getAttribute('href')}`
    } : null)).filter(Boolean).filter(obj => obj?.label.includes('1906'))
  })

  //@ts-ignore
  await crawler.addRequests(queue)
});

router.addHandler('1906 - Central de Vendas', async ({ page }) => {
  await page.waitForLoadState(`load`)

  const container = page.locator('.fastsearchContainerSearch')
  await container.click()
  const order = '854520'
  await page.locator('input[name=idVenda]').fill(order)
  await page.press('input[name=idVenda]', 'Enter')

  const resultTable = page.locator('tbody > tr > td')

  const firstResult = await resultTable.first().textContent()

  if (firstResult === 'Nenhum registro encontrado') {
    console.log('nada encontrado')
    return
  }

  const numberNFField = resultTable.nth(5)
  const numberNf = await numberNFField.textContent()
  
  if (numberNf === '') {
    console.log('Nao existe link')
    return
  }

  await numberNFField.click()
  const downloadPromise = page.waitForEvent('download')
  await page.waitForURL('**\/ver_assistente\/**')
  const download = await downloadPromise
  const pathDownload = path.join(process.cwd(), 'storage', 'downloads', order, download.suggestedFilename())
  await download.saveAs(pathDownload)

  //console.log(pathDownload)
  const downloadButton = page.getByRole('link', { name: 'Download XML'})

  const downloadPromise2 = page.waitForEvent('download')
  await downloadButton.click()
  const download2 = await downloadPromise2
  
  const pathDownload2 = path.join(process.cwd(), 'storage', 'downloads', order, download2.suggestedFilename())
  await download2.saveAs(pathDownload2)
})

router.addDefaultHandler(({request}) => {
  console.log(request.label)
})