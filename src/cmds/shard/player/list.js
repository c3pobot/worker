'use strict'
const mongo = require('mongoclient')
const sorter = require('json-array-sorter')

const { getShardName, truncateString } = require('src/helpers')
const { webHookMsg } = require('src/helpers/discordmsg')

module.exports = async(obj = {}, shard = {}, opt = {})=>{
  let shardPlayers = await mongo.find('shardPlayers', {shardId: shard._id}, {_id: 1, name: 1, allyCode: 1, notify: 1, emoji: 1})
  if(!shardPlayers || shardPlayers?.length == 0) return { content: 'no shard players registered' }


  let pId = shardPlayers.map(x=>x._id)
  let rankCache = await mongo.find('shardRankCache', {_id: {$in: pId}}, {_id: 1, rank: 1})
  if(!rankCache || rankCache?.length == 0) return { content: 'error getting rankCache' }

  let sortedPlayers = sorter([{column: 'name', order: 'ascending'}], shardPlayers)

  let fieldLength = 30, numMsgs = 1
  if(+sortedPlayers.length < 30) fieldLength = +sortedPlayers.length
  let count = 0, embedMsg = {
    color: 15844367,
    description: '',
    timestamp: new Date()
  }
  for(let i in sortedPlayers){
    let tempRank = rankCache.find(x=>x._id === sortedPlayers[i]._id)?.rank || 0
    if(i == 0){
      embedMsg.title = getShardName(shard.type)+' Arena Registerd Players'
      embedMsg.description = 'Found '+sortedPlayers.length+' players\nallyCode : notify : rank : name\n'
    }
    embedMsg.description += '`'+sortedPlayers[i].allyCode+'`: '+sortedPlayers[i].notify.status+' : '+tempRank+' : '+(sortedPlayers[i].emoji ? sortedPlayers[i].emoji:'')+truncateString(sortedPlayers[i].name, 15)+'\n';
    count++
    if(+i + 1 == shardPlayers.length && count < fieldLength) count = +fieldLength
    if(count == fieldLength){
      await webHookMsg(obj.token, {  embeds: [JSON.parse(JSON.stringify(embedMsg))] }, 'POST')
      delete embedMsg.title
      embedMsg.description = 'allyCode : notify : name\n'
      count = 0
    }
  }
}
