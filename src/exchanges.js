'use strict'
const mongo = require('mongoclient')
const log = require('logger')
const rabbitmq = require('./helpers/rabbitmq')

const { setNumShards } = require('./helpers/botRequest/botInfo')
const updateDataList = require('./helpers/updateDataList')

let POD_NAME = process.env.POD_NAME || 'worker', NAME_SPACE = process.env.NAME_SPACE || 'default'
let QUE_NAME = `${NAME_SPACE}.${POD_NAME}.topic`
let SET_EXCHANGE = process.env.BOT_SET_EXCHANGE || 'k8-status', DATA_EXCHANGE_NAME = process.env.GAME_DATA_EXCHANGE || `data-sync`
let SET_ROUTING_KEY = process.env.BOT_SET_TOPIC || `statefulset.${NAME_SPACE}.bot`, DATA_ROUTING_KEY = process.env.GAME_DATA_TOPIC || `${NAME_SPACE}.${DATA_EXCHANGE_NAME}.game-data`

let exchanges = [{ exchange: SET_EXCHANGE, durable: true, type: 'topic'}, { exchange: DATA_EXCHANGE_NAME, durable: true, type: 'topic'}]
let queueBindings = [{ exchange: SET_EXCHANGE, routingKey: SET_ROUTING_KEY, queue: QUE_NAME }, { exchange: DATA_EXCHANGE_NAME, routingKey: DATA_ROUTING_KEY, queue: QUE_NAME }]
let consumer
const cmdProcessor = (msg = {})=>{
  try{
    if(!msg.body || !msg.routingKey) return
    if(msg.routingKey === SET_ROUTING_KEY) setNumShards(msg.body)
    if(msg.routingKey === DATA_ROUTING_KEY) updateDataList(msg.body)
  }catch(e){
    log.error(e)
  }
}
const startConsumer = async()=>{
  try{
    let status = mongo.status()
    if(status) status = rabbitmq.ready
    if(!status){
      setTimeout(startConsumer, 5000)
      return
    }
    if(consumer) await consumer.close()
    consumer = rabbitmq.createConsumer({
      consumerTag: POD_NAME,
      queue: QUE_NAME,
      exchanges: exchanges,
      queueBindings: queueBindings,
      queueOptions: { queue: QUE_NAME, durable: false, exclusive: true, arguments: { 'x-message-ttl': 6000 } }
    }, cmdProcessor)
    consumer.on('error', (err)=>{
      log.info(err)
    })
    consumer.on('ready', ()=>{
      log.info(`${POD_NAME} topic consumer created...`)
    })
  }catch(e){
    log.error(e)
    setTimeout(startConsumer, 5000)
  }
}
startConsumer()
