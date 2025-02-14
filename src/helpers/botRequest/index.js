'use strict'
const log = require('logger')
const rpcClient = require('src/rpcClient')

const { dataList } = require('src/helpers/dataList')

let BOT_SET_NAME = process.env.BOT_SET_NAME || 'bot'

const allBotRequest = async(cmd, opts = {})=>{
  if(!dataList?.numBotShards) return

  let array = [], res = [], i = dataList?.numBotShards, count = 0
  while(count<i){
    array.push(rpcClient.get(cmd, {...opts,...{ podName: `${BOT_SET_NAME}-${count}` }}))
    count++
  }
  let tempRes = await Promise.allSettled(array)
  for(let i in tempRes){
    if(tempRes[i]?.value) res.push(tempRes[i].value)
  }
  return res
}

module.exports = async(cmd, opts = {})=>{
  if(!cmd) return
  let podName = opts.podName
  if(!podName) podName = getPodName(opts.sId)
  if(!podName) return
  if(podName === 'all') return await allBotRequest(cmd, opts)
  return await rpcClient.get(cmd, {...opts,...{ podName: podName }})
}
