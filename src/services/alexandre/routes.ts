import { createPlaywrightRouter } from 'crawlee';
import { captureNf } from './captureNf.js';

import { config } from 'dotenv';

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
      userData    
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
      url: `https://srv1.meuewiki.com.br/mgerencia/#${element.getAttribute('href')}`,
      uniqueKey: `https://srv1.meuewiki.com.br/mgerencia/#${element.getAttribute('href')}-${userData.data.order}`
    } : null)).filter(Boolean).filter(obj => obj?.label.includes(userData.route))
  }, userData)
  
  //@ts-ignore
  await crawler.addRequests(queue)
});

router.addHandler('1906 - Central de Vendas', captureNf)

router.addDefaultHandler(({request}) => {
  console.log(request.label)
})

export { router };
