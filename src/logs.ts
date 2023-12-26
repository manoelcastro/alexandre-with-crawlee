import { QueueEvents } from 'bullmq'

interface IQueueEvent {
  queues: QueueEvents[],
  on: (names: string[]) => void,
  track: () => void
}

const queues = ['captureNf', 'captureEstoque', 'captureHistory']

const events: IQueueEvent = {
  queues: [],
  on: (names: string[]) => {
    events.queues = names.map(name => new QueueEvents(name, {
      connection: {
        host: '127.0.0.1',
        port: 6379
      }
    }))
  },
  track: () => {
    events.queues.forEach(queue => queue.on('active', ({ jobId }) => {
      console.log(`O job ${jobId} da fila ${queue.name} esta ativo`)
    }))
  }
}

events.on(queues)

events.track()