'use strict'
const log = require('logger')
const rabbitmq = require('src/helpers/rabbitmq')
const POD_NAME = process.env.POD_NAME || 'worker'
let QUE_NAME = process.env.WORKER_QUE_NAME_SPACE || 'default', publisher, publisherReady
QUE_NAME += '.worker.discord'
module.exports.start = async()=>{
  publisher = rabbitmq.createPublisher({ confirm: true, queues: [{ queue: QUE_NAME, durable: true, arguments: {'x-queue-type': 'quorum', 'x-message-ttl': 600000 } }] })
  publisherReady = true
  log.info(`${POD_NAME} discord publisher is ready...`)
  return true
}
module.exports.add = async(data = {})=>{
  if(!publisherReady) return
  await publisher.send(QUE_NAME, data)
  return true
}
