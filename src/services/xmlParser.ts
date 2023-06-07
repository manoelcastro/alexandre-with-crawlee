import fs from 'fs/promises'
import chokidar from 'chokidar'
import { xml2json } from '../utils/xml2json'

export const convertXmlToJsonTracker = async (sourceFolder: string, destFolder: string) => {
  const watcher = chokidar.watch(sourceFolder, {
    persistent: true,
    ignored: /(^|[\/\\])\../, // ignore arquivos ocultos
    ignoreInitial: true,
    awaitWriteFinish: true
  })
  
  watcher.on('add', async (path) => {
    console.log(`Arquivo adicionado: ${path}`)
  
    try {
      const xmlDocument = await fs.readFile(path, 'utf-8')
      const json = await xml2json(xmlDocument)
      
      const { chNFe } = json.nfeProc.protNFe.infProt
      
      saveJson(chNFe, json) 
      
    } catch (err) {
      console.log(err)
    }   
  })
 
  async function saveJson(name: string, data: any) {
    try {
      const jsonDocument = await fs.open(`${destFolder}/${name}.json`, 'w')
      
      await jsonDocument.writeFile(JSON.stringify(data))
      await jsonDocument.close()
      
      console.log(`Arquivo salvo: ${name}.json`)
      
    } catch (err) {
      console.log(err)
    }
    
  }
}