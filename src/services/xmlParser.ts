import fs from 'fs'
import xml from 'xml2js'
import chokidar from 'chokidar'


const parser = new xml.Parser({ explicitArray: false })
const folderPath = 'xml/'

const watcher = chokidar.watch(folderPath, {
  persistent: true,
  ignored: /(^|[\/\\])\../, // ignore arquivos ocultos
  ignoreInitial: true,
  awaitWriteFinish: true
})

watcher.on('add', (path) => {
  console.log(`Arquivo adicionado: ${path}`) 
   
  fs.readFile(path, 'utf-8', (err, data) => {
    if (err) {
      console.log(err)
      return
    }

    parser.parseString(data, (err, result) => {
      if (err) {
        console.log(err)
        return
      }
      
      const { chNFe } = result.nfeProc.protNFe.infProt 
      
      fs.open(`json/${chNFe}.json`, 'w', (err, fd) => {
        if (err) {
          console.log(err)
          return
        }
        fs.writeFile(fd, JSON.stringify(result), (err) => {
          if (err) {
            console.log(err)
            return
          }
          console.log('done')
          fs.close(fd, (err) => {
            if (err) {
              console.log(err)
              return
            }
          })
        })
      })
    })
  })
})
