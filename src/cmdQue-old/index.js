'use strict'
const log = require('logger')
const rabbitmq = require('src/helpers/rabbitmq')
const cmdProcessor = require('./cmdProcessor')
const publisher = require('./publisher')
let QUE_NAME = process.env.WORKER_QUE_NAME_SPACE || process.env.NAME_SPACE || 'default', WORKER_TYPE = process.env.WORKER_TYPE || 'swgoh', POD_NAME = process.env.POD_NAME || 'worker', consumer
QUE_NAME += `.worker.${WORKER_TYPE}`
if(process.env.PRIVATE_WORKER) QUE_NAME += '.private'
const processMsg = async(msg = {})=>{
  try{
    if(!msg.body) return
    return await cmdProcessor(msg.body)
  }catch(e){
    log.error(e)
  }
}
const createWorker = async()=>{
  try{
    if(consumer) await consumer.close()
    consumer = rabbitmq.createConsumer({ consumerTag: POD_NAME, concurrency: 1, qos: { prefetchCount: 1 }, queue: QUE_NAME, queueOptions: { arguments: { 'x-message-ttl': 600000 } } }, processMsg)
    consumer.on('error', (err)=>{
      log.info(err)
    })
    consumer.on('ready', ()=>{
      log.info(`${POD_NAME} ${WORKER_TYPE} consumer created...`)
    })
    return true
  }catch(e){
    throw(e)
  }
}
module.exports.start = async() =>{
  let status = await createWorker()
  if(status) status = await publisher.start()
  return status
}
