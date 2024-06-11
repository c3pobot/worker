'use strict'
const { getPayouts, getShardName } = require('src/helpers')
const { webHookMsg } = require('src/helpers/discordmsg')

module.exports = async(obj = {}, shard = {}, opt = {})=>{
  let fields = await getPayouts(shard)
  if(!fields || fields?.length == 0) return {content: 'Error getting payouts'}

  let fieldLength = +fields.length, numMsgs = 1
  if(fieldLength > 25 && numMsgs == 1) numMsgs = Math.round( +fieldLength / 25)
  if(fieldLength > 25 && numMsgs == 1) numMsgs = 2
  if(numMsgs > 1) fieldLength = Math.round( +fields.length / numMsgs)
  let embedMsg = {
    color: 15844367,
    fields: []
  }
  let count = 0
  for(let i in fields){
    if(i == 0){
      embedMsg.title = getShardName(shard)+' Arena Payouts'
      if(shard.message && shard.message != 'default') embedMsg.description = shard.message.replace('<br>', '\n')
    }
    embedMsg.fields.push(fields[i])
    count++
    if(+i + 1 == fields.length && count < fieldLength) count = +fieldLength
    if(+i + 1 == fields.length){
      embedMsg.timestamp = new Date()
      embedMsg.footer = {text: 'Updated'}
    }
    if(count == fieldLength){
      await webHookMsg(obj.token, { embeds: [JSON.parse(JSON.stringify(embedMsg))] }, 'POST')
      delete embedMsg.title
      delete embedMsg.description
      embedMsg.fields = []
      count = 0
    }
  }
}
