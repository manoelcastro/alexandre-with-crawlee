import { Worker } from 'bullmq'
import './logs.js'
import { Alexandre } from './services/alexandre/main.js'

const captureNfWorker = new Worker('captureNf', async job => {
  const alexandreInstance = new Alexandre()
  const { order } = job.data
  
  await alexandreInstance.execute({
    route: '1906', action: 'captureNf', data: { order }
  })
}, { connection: { host: '127.0.0.1', port: 6379 } })

captureNfWorker.on('completed', ({name}) => {
  // Enviar NF para o Noah
})

const suggest = new Worker('suggest', async job => {
  const alexandreInstance = new Alexandre()
  const {products} = job.data

  await alexandreInstance.execute({
    route: '1700',
    action: 'suggest',
    data: {
      products: JSON.parse(products)
    }
  })
}, { connection: { host: '127.0.0.1', port: 6379 } })

suggest.on('completed', () => console.log('terminou'))

const parseEntryNf = new Worker('parseEntryNf', async job => {
  const alexandreInstance = new Alexandre()
  const {order} = job.data

  await alexandreInstance.execute({
    route: '1200',
    action: 'parseEntryNf',
    data: { order }
  })
}, { connection: { host: '127.0.0.1', port: 6379 } })

parseEntryNf.on('completed', () => console.log('terminou'))

/* const captureEstoqueWorker = new Worker('captureEstoque', async job => {
  const alexandreInstance = new Alexandre()
  const { cod } = job.data

  await alexandreInstance.execute({
    route: '1200', action: 'captureEstoque', data: { cod }
  })
},  { connection: { host: '127.0.0.1', port: 6379 } })

const captureHistoryWorker = new Worker('captureHistory', async job => {
  const alexandreInstance = new Alexandre()
  const { cod } = job.data

  await alexandreInstance.execute({
    route: '3971', action: 'captureHistory', data: { cod }
  })
}, { connection: { host: '127.0.0.1', port: 6379 }, concurrency: 3 }) */

/* const captureHistoryEvents = new QueueEvents('captureHistory', {
  connection: {
    host: '127.0.0.1',
    port: 6379
  }
})


captureHistoryEvents.on('error', error => console.log('Deu erro => ', error) )

captureHistoryEvents.on('failed', ({ 
  jobId,
  failedReason,
  prev
}) => {
  console.log('Falhou => ', jobId, failedReason)
}) */