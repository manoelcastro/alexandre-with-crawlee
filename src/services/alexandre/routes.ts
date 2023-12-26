import { createPlaywrightRouter } from 'crawlee'
import { v4 as uuidv4 } from 'uuid'
import { captureNf } from './captureNf.js'

import { config } from 'dotenv'
import { captureEstoque } from './captureEstoque.js'
import { captureHistory } from './captureHistory.js'
import { captureSuggest } from './captureSuggest.js'
import { parseEntryNf } from './parseEntryNf.js'

config()

const router = createPlaywrightRouter();

router.addHandler('login', async ({ crawler, page, request }) => {
    const { userData } = request

    const userField = page.getByPlaceholder('Usuário')
    const passField = page.getByPlaceholder('Senha')

    await userField.type(process.env.ERP_USER!)
    await passField.type(process.env.ERP_PASSWORD!)
    await passField.press('Enter')
  
    await page.waitForLoadState('load')
    
    await crawler.addRequests([{
      url: page.url(),
      label: 'inicial',
      userData,
      uniqueKey: uuidv4()    
    }])
});

router.addHandler('inicial', async ({ page, crawler, request }) => {
  const { userData } = request

  await page.waitForSelector('.fw_menu')
  
  const modal = page.locator('.fw_menu_container')
  const links = modal.locator('a')
  
  const queue = await links.evaluateAll((elements, userData) => {    
    return elements.map(element => (element.textContent !== '' ? {
      userData,
      label: element.textContent as string,
      url: `https://srv1.meuewiki.com.br/mgerencia/#${element.getAttribute('href')}`
    } : null)).filter(Boolean).find(obj => obj?.label.includes(userData.route))
  }, userData)

  //@ts-ignore
  await crawler.addRequests([{...queue, uniqueKey: uuidv4(), label: `${userData.action}`}])
});

router.addHandler('captureNf', captureNf)
router.addHandler('captureEstoque', captureEstoque)
router.addHandler('captureHistory', captureHistory)
router.addHandler('parseEntryNf', parseEntryNf)
router.addHandler('suggest', captureSuggest)

router.addDefaultHandler(({request}) => {
  console.log('isso aqui', request.label)
})

export { router }

