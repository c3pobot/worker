'use strict'
const log = require('logger')
const rabbitmq = require('helpers/rabbitmq')
const cmdProcessor = require('./cmdProcessor')
let queName = process.env.WORKER_QUE_PREFIX || 'worker', consumer, workerType = process.env.WORKER_TYPE || 'swgoh', POD_NAME = process.env.POD_NAME
queName += `.${workerType}`
if(process.env.PRIVATE_WORKER) queName += '.private'
const processMsg = async(msg = {})=>{
  try{
    if(!msg.body) return
    return await cmdProcessor(msg.body)
  }catch(e){
    log.error(e)
    return 1
  }
}
const createWorker = async()=>{
  try{
    if(consumer) await consumer.close()
    consumer = rabbitmq.createConsumer({ concurrency: 1, qos: { prefetchCount: 1 }, queue: queName, queueOptions: { durable: true, arguments: { 'x-queue-type': 'quorum' } } }, processMsg)
    consumer.on('error', (err)=>{
      if(err?.code){
        log.error(err.code)
        log.error(err.message)
        return
      }
      log.error(err)
    })
    log.info(`rabbitmq consumer started on ${POD_NAME}`)
    return true
  }catch(e){
    throw(e)
  }
}
module.exports.start = async() =>{
  try{
    let status = await createWorker()
    return status
  }catch(e){
    throw(e)
  }
}
