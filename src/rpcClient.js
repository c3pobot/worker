'use strict'
const log = require('logger')
const rabbitmq = require('./rabbitmq/client')

let exchanges = [{ exchange: 'bot.msg', type: 'topic', maxAttempts: 5 }], rpcClient, POD_NAME = process.env.POD_NAME || 'worker'

const start = async()=>{
  try{
    if(rabbitmq?.ready){
      rpcClient = rabbitmq.createRPCClient({ exchanges: exchanges, timeout: 10000 })
      log.info(`${POD_NAME} rpcClient created...`)
      return
    }
    setTimeout(start, 5000)
  }catch(e){
    log.error(e)
    setTimeout(start, 5000)
  }
}
start()
module.exports = {
  get status(){
    return rpcClient?.active
  }
}
module.exports.get = async(cmd, payload = {})=>{
  try{
    if(!cmd || !rpcClient?.active || !payload?.podName) return
    let res = await rpcClient.send({ routingKey: payload.podName, exchange: 'bot.msg' }, {...payload,...{ cmd: cmd, rpcCall: true }})
    return res?.body
  }catch(e){
    log.error(e)
  }
}
