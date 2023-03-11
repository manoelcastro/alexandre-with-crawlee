import { Dataset, createPlaywrightRouter } from 'crawlee';

export const router = createPlaywrightRouter();

router.addDefaultHandler(async ({ enqueueLinks, log }) => {
    log.info(`enqueueing new URLs`);
    await enqueueLinks({
        globs: ['https://crawlee.dev/**'],
        label: 'detail',
    });
});

router.addHandler('login', async ({ crawler, request, page, log }) => {
    const userField = page.getByPlaceholder('Usuário')
    const passField = page.getByPlaceholder('Senha')

    await userField.type('alexandre')
    await passField.type('alexandre')
    await passField.press('Enter')

    await page.waitForLoadState('load')
    log.info(page.url())
    await crawler.addRequests([{
        url: page.url(),
        label: 'inicial'    
    }])
});

router.addHandler('inicial', async ({ request, page, log }) => {
    log.info('Chegando em inicial')
    log.info(request.url)

    await page.waitForSelector('.fw_menu')

    const modal = await page.locator('.fw_menu_container').innerHTML()
    log.info(`${modal}`)
});