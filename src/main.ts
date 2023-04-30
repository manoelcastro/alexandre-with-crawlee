import { Worker } from 'bullmq'
import { Alexandre } from './services/alexandre/main.js'

const alexandreInstance = new Alexandre()

const worker = new Worker('captureNf', async job => {
  const { order } = job.data

  await alexandreInstance.execute({route: '1906', data: {order}})

})

worker.on('completed', job => console.log(`${job.id} has completed`))