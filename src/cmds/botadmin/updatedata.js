'use strict'
const log = require('logger')
const rabbitmq = require('src/rabbitmq')
let queName = process.env.WORKER_QUE_PREFIX || 'worker'
queName += `.data-sync.updateRequest`

module.exports = async(obj = {}, opt = [])=>{
  //if(!producerReady) return { content: 'Message bus is not ready yet...'}
  //rabbitmq.notify(queName, obj)
  return { content: 'Data Update Request Sent' }
}
