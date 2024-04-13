'use strict'
const mqtt = require('./mqtt');
const BOT_NAMESPACE = process.env.BOT_NAMESPACE || 'default', SET_NAME = process.env.BOT_SET_NAME
let botTopic = `k8-status/statefulset/${BOT_NAMESPACE}/${SET_NAME}`, NUM_SHARDS = 0
mqtt.on('message', (topic, msg)=>{
  try{
    if(!msg || topic !== botTopic) return
    let data = JSON.parse(msg)
    if(data.replicas !== NUM_SHARDS){
      log.info(`Number of bot shards changed from ${NUM_SHARDS} to ${data.replicas}...`)
      NUM_SHARDS = +data.replicas
    }
  }catch(e){
    log.error(e)
  }
})
const checkMQTTStatus = async()=>{
  try{
    if(mqtt.connected){
      await mqtt.subscribe(botTopic, { qos: 1, rh: true })
      return
    }
    setTimeout(checkMQTTStatus, 5000)
  }catch(e){
    log.error(e)
    setTimeout(checkMQTTStatus, 5000)
  }
}
checkMQTTStatus()
module.exports = (sId)=>{
  if(NUM_SHARDS > 0 && sId > 0){
    let shardId = (Number(BigInt(sId) >> 22n) % (NUM_SHARDS))
    return shardId?.toString()
  }
}
