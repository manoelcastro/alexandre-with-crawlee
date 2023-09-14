import { Worker } from 'bullmq'
import { Alexandre } from './services/alexandre/main.js'


const captureNfWorker = new Worker('captureNf', async job => {
  const alexandreInstance = new Alexandre()
  const { order } = job.data
  
  await alexandreInstance.execute({
    route: '1906', data: { order }
  })
})

const other = new Worker('other', async job => {
  const alexandreInstance = new Alexandre()
  const { cod } = job.data

  await alexandreInstance.execute({
    route: '1200', data: { cod }
  })
})

captureNfWorker.on('completed', job => console.log(`${job.id} has completed`))
other.on('completed', job => console.log(`terminamos ${job.id}`))