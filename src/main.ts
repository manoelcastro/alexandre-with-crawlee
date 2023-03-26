// For more information, see https://crawlee.dev/
import { PlaywrightCrawler } from 'crawlee';
import { router } from './routes.js';

const startUrls = [{
    url:'https://srv1.meuewiki.com.br/mgerencia/login/casaarruda.com.br/mFtwWkgMZ5hx74SyXRQB',
    label: 'login'
}];

const crawler = new PlaywrightCrawler({
    requestHandler: router
});

await crawler.run(startUrls);
