'use strict'
const log = require('logger')
const client = require('src/rabbitmq/client')
const cmdProcessor = require('./cmdProcessor')

let POD_NAME = process.env.POD_NAME || 'worker', consumerStatus = false, WORKER_TYPE = process.env.WORKER_TYPE || 'swgoh'
let QUE_NAME = `worker.${WORKER_TYPE}`
if(process.env.PRIVATE_WORKER) QUE_NAME += '.private'

const processCmd = async(msg = {})=>{
  try{
    if(!msg.body) return
    return await cmdProcessor(msg?.body)
  }catch(e){
    log.error(e)
  }
}

const consumer = client.createConsumer({
  consumerTag: POD_NAME,
  concurrency: 1,
  qos: { prefetchCount: 1 },
  queue: QUE_NAME,
  queueOptions: { arguments: { 'x-message-ttl': 600000 } },
  lazy: true
}, processCmd)

consumer.on('error', (err)=>{
  log.error(err)
})
consumer.on('ready', ()=>{
  log.info(`${POD_NAME} ${QUE_NAME} consumer created...`)
})

const stopConsumer = async()=>{
  try{
    await consumer.close()
  }catch(e){
    log.error(e)
  }
}
const startConsumer = async()=>{
  try{
    await stopConsumer()
    let status = client.ready
    if(!status) return
    await consumer.start()
    return true
  }catch(e){
    log.error(e)
  }
}
const watch = async() =>{
  try{
    if(client.ready){
      if(!consumerStatus){
        consumerStatus = await startConsumer()
        if(consumerStatus){
          log.info(`${POD_NAME} ${QUE_NAME} consumer started...`)
        }
      }
    }else{
      if(consumerStatus){
        consumerStatus = await stopConsumer()
        if(!consumerStatus) log.info(`${POD_NAME} ${QUE_NAME} consumer stopped...`)
      }
    }
    setTimeout(watch, 5000)
  }catch(e){
    log.error(e)
    setTimeout(watch, 5000)
  }
}
module.exports.start = () =>{
  try{
    watch()
  }catch(e){
    log.error(e)
  }
}
