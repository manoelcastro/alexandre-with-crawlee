import { createPlaywrightRouter } from 'crawlee';
import {a} from './cer'

const ab = a
export const router = createPlaywrightRouter();

const routine = '1906'

//const f = await captureNf({order: '754658'})

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

/* router.addHandler('1906 - Central de Vendas') */

router.addDefaultHandler(({request}) => {
  console.log(request.label)
})

/* 
await page.waitForLoadState(`load`)

  const container = page.locator('.fastsearchContainerSearch')
  await container.click()
  const order = '795404'
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
  const typeNF = await resultTable.nth(4).textContent()

  await numberNFField.click()
  const downloadPromise = page.waitForEvent('download')
  await page.waitForURL('**\/ver_assistente\/**')
  const download = await downloadPromise
  const name = `${typeNF}_${numberNf}.${download.suggestedFilename().split('.').at(-1)}`
  const pathDownload = path.join(process.cwd(), 'storage', 'downloads', order, name)
  await download.saveAs(pathDownload)

  //console.log(pathDownload)
  const downloadButton = page.getByRole('link', { name: 'Download XML'})

  const downloadPromise2 = page.waitForEvent('download')
  await downloadButton.click()
  const download2 = await downloadPromise2
  const name2 = `${typeNF}_${numberNf}.${download2.suggestedFilename().split('.').at(-1)}`
  const pathDownload2 = path.join(process.cwd(), 'storage', 'downloads', order, name2)
  await download2.saveAs(pathDownload2) */