import { createPlaywrightRouter } from 'crawlee';
import { captureNf } from './captureNf.js';

const router = createPlaywrightRouter();

router.addHandler('login', async ({ crawler, page }) => {
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

router.addHandler('inicial', async ({ page, crawler }) => {
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

router.addHandler('1906 - Central de Vendas', captureNf({order: '864023'}))

router.addDefaultHandler(({request}) => {
  console.log(request.label)
})

export { router }