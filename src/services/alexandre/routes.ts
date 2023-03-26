import { createPlaywrightRouter } from 'crawlee';
import { captureNf } from './captureNf.js';

const router = createPlaywrightRouter();

router.addHandler('login', async ({ crawler, page, request }) => {
    const { userData } = request

    const userField = page.getByPlaceholder('Usuário')
    const passField = page.getByPlaceholder('Senha')

    await userField.type('alexandre')
    await passField.type('alexandre')
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
  const { route } = userData

  await page.waitForSelector('.fw_menu')
  
  const modal = page.locator('.fw_menu_container')
  const links = modal.locator('a')
  

  const menu = await links.evaluateAll(elements => {    
    return elements.map(element => (element.textContent !== '' ? {
      label: element.textContent as string,
      url: `https://srv1.meuewiki.com.br/mgerencia/#${element.getAttribute('href')}`,
      uniqueKey: `https://srv1.meuewiki.com.br/mgerencia/#${element.getAttribute('href')}`
    } : null)).filter(Boolean)
  })

  const queue = menu.filter(obj => obj?.label.includes(route)).map(q => ({...q, userData}))
  
  //@ts-ignore
  await crawler.addRequests(queue)
});

router.addHandler('1906 - Central de Vendas', captureNf)

router.addDefaultHandler(({request}) => {
  console.log(request.label)
})

export { router }