'use strict'
const log = require('logger')
const fetch = require('./fetch')
const { dataList } = require('src/helpers/dataList')
const BOT_NAMESPACE = process.env.BOT_NAMESPACE || process.env.NAME_SPACE || 'default', BOT_SET_NAME = process.env.BOT_SET_NAME || 'bot', BOT_SVC = process.env.BOT_SVC || 'bot', BOT_SVC_PORT = process.env.BOT_SVC_PORT || 3000

const getId = (sId)=>{
  if(!dataList.numBotShards || !sId) return
  let shardId = (Number(BigInt(sId) >> 22n) % (dataList.numBotShards))
  return shardId?.toString()
}
module.exports.getId = getId
module.exports.getPodName = (sId)=>{
  if(!sId) return
  let shardId = getId(sId)
  if(!shardId) return
  return `${BOT_SET_NAME}-${shardId}`
}
module.exports.getNumShards = ()=>{
  return dataList.numBotShards
}
