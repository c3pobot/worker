'use strict'
const log = require('logger')
const rpcClient = require('src/rpcClient')
const { dataList } = require('src/helpers/dataList')

const BOT_SET_NAME = process.env.BOT_SET_NAME || 'bot'

const getId = (sId)=>{
  if(!dataList?.numBotShards || !sId) return
  let shardId = (Number(BigInt(sId) >> 22n) % (dataList.numBotShards))
  return shardId?.toString()
}
const getPodName = (sId)=>{
  if(!sId) return
  let shardId = getId(sId)
  if(!shardId) return
  return `${BOT_SET_NAME}-${shardId}`
}
module.exports = async(cmd, opts = {})=>{
  if(!cmd) return
  if(!opts.podName) opts.podName = getPodName(opts.sId)
  if(!opts.podName && cmd === 'sendDM') opts.podName = `${BOT_SET_NAME}-0`
  if(!opts.podName){
    log.debug(`Error getting podName...`)
    return
  }
  return await rpcClient.get(cmd, {...opts,...{ cmd: cmd }} )
}
module.exports.getId = getId
