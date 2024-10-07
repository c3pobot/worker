'use strict'
const log = require('logger')
const rabbitmq = require('src/helpers/rabbitmq')

let WORKER_QUE_NAME_SPACE = process.env.WORKER_QUE_NAME_SPACE || process.env.NAME_SPACE || 'default'
let queues = [ 'discord', 'tw-guild'], publisher, publisherReady
if(process.env.WORKER_QUES) queues = JSON.parse(process.env.WORKER_QUES)
let PRIVATE_QUES = process.env.PRIVATE_QUES || false, POD_NAME = process.env.POD_NAME || 'bot'

module.exports.start = async()=>{
  let payload = { confirm: true, queues: [] }
  for(let i in queues) payload.queues.push({ queue: `${WORKER_QUE_NAME_SPACE}.worker.${queues[i]}`, arguments: {  'x-message-ttl': 600000 }})
  publisher = rabbitmq.createPublisher(payload)
  publisherReady = true
  return true
}
module.exports.add = async(queName, data = {})=>{
  if(!publisher) return
  let key = `${WORKER_QUE_NAME_SPACE}.worker.${queName}`
  await publisher.send(key, data)
  return true
}
