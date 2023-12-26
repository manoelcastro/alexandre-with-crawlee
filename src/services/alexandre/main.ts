// For more information, see https://crawlee.dev/
import { PlaywrightCrawler } from 'crawlee';
import { v4 as uuidv4 } from 'uuid';
import { router } from './routes.js';

class Alexandre {
  private crawler

  constructor() {
    this.crawler = new PlaywrightCrawler({
      requestHandler: router,
      headless: true,
      keepAlive: false,
      requestHandlerTimeoutSecs: 1800,
      minConcurrency: 8 
    })
  }

  async execute({ route, action, data }: { route: string, action: string, data: any }) {
    const startUrls = [{
      url:'https://srv1.meuewiki.com.br/mgerencia/login/casaarruda.com.br/mFtwWkgMZ5hx74SyXRQB',
      label: 'login',
      userData: {
        route,
        action,
        data  
      },
      uniqueKey: uuidv4()
    }];
    
    await this.crawler.run(startUrls);
  }
}

export { Alexandre };
