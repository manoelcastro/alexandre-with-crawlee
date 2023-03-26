// For more information, see https://crawlee.dev/
import { PlaywrightCrawler } from 'crawlee';
import { router } from './routes.js';

const crawler = new PlaywrightCrawler({
    requestHandler: router,
});

export const alexandre = {
  execute: async ({ route, data }: {route: string, data: any}) => {
    const startUrls = [{
      url:'https://srv1.meuewiki.com.br/mgerencia/login/casaarruda.com.br/mFtwWkgMZ5hx74SyXRQB',
      label: 'login',
      userData: {
        route,
        data  
      }
    }];
    
    await crawler.run(startUrls);
  }
}