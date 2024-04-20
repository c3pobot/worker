'use strict'
const log = require('logger')
const rabbitmq = require('src/helpers/rabbitmq')
let queName = process.env.WORKER_QUE_PREFIX || 'worker'
queName += `.data-sync.updateRequest`
let producerReady, producer
const createProducer = async()=>{
  try{
    producer = rabbitmq.createPublisher({confirm: true, queues: [{ queue: queName, durable: true, arguments: { 'x-queue-type': 'quorum' } }]})
    producer.on('retry', (err, payload, body)=>{
      log.error('Retry on job')
    })
    producerReady = true
  }catch(e){
    log.error(e)
    setTimeout(createProducer, 5000)
  }
}
createProducer()
module.exports = async(obj = {}, opt = [])=>{
  if(!producerReady) return { content: 'Message bus is not ready yet...'}
  producer.send(queName, obj)
  return { content: 'Data Update Request Sent' }
}
