import { Alexandre } from './services/alexandre/main.js'

const alexandreInstance = new Alexandre()

/* const worker = new Worker('captureNf', async job => {
  const { order } = job.data
  console.log('hey, ', order)

  await alexandreInstance.execute({
    route: '1906', data: { order }
  })
})

worker.on('completed', job => console.log(`${job.id} has completed`)) */

alexandreInstance.execute({
  route: '1200', data: { cod: '902559'}
})