// For more information, see https://crawlee.dev/
import { PlaywrightCrawler } from 'crawlee';
import { v4 as uuidv4 } from 'uuid';
import { router } from './routes.js';

class Alexandre {
  private crawler

  constructor() {
    this.crawler = new PlaywrightCrawler({ requestHandler: router, headless: true })
  }

  async execute({ route, data }: { route: string, data: any }) {
    const startUrls = [{
      url:'https://srv1.meuewiki.com.br/mgerencia/login/casaarruda.com.br/mFtwWkgMZ5hx74SyXRQB',
      label: 'login',
      userData: {
        route,
        data  
      },
      uniqueKey: uuidv4()
    }];
    
    await this.crawler.run(startUrls);
  }
}

export { Alexandre };

/* 
const alexandre = () => {
  const crawler = new PlaywrightCrawler({
    requestHandler: router,
  })

  return {
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
  },
  addRequests: async ({ route, data }: {route: string, data: any}) => {
    await crawler.addRequests([{
      url: 'https://srv1.meuewiki.com.br/mgerencia/#index/index',
      uniqueKey: `https://srv1.meuewiki.com.br/mgerencia/#index/index-${data.order}`,
      label: 'inicial',
      userData: {
        route,
        data
      }
    }])
  }
  }
} */