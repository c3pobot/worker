'use strict'
const mongo = require('mongoclient')
const sorter = require('json-array-sorter')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'There are no payout shards'}
  let shards = await mongo.find('payoutServers', {})
  if(shards && shards.length > 0){
    let tempShards = {}
    for(let i in shards){
      let playerCount = await mongo.count('shardPlayers', {shardId: shards[i]._id})
      if(!tempShards[shards[i].shard]) tempShards[shards[i].shard] = {shardNum: shards[i].shard, playerCount: 0, servers: 0}
      if(tempShards[shards[i].shard]){
        tempShards[shards[i].shard].playerCount += +playerCount || 0
        tempShards[shards[i].shard].servers++;
      }
    }
    let sortedArray = sorter([{column: 'shardNum', order: 'ascending'}], Object.values(tempShards))
    let embedMsg = {
      title: 'Payout Servers',
      color: 15844367,
      fields: []
    }
    let totalPlayers = 0
    for(let i in sortedArray){
      totalPlayers += +sortedArray[i].playerCount || 0
      let tempObj = {
        name: 'Shard '+sortedArray[i].shardNum,
        value: '```\n'
      }
      tempObj.value += 'Servers : '+sortedArray[i].servers+'\n'
      tempObj.value += 'players : '+sortedArray[i].playerCount+'\n'
      tempObj.value += '```'
      embedMsg.fields.push(tempObj)
    }
    embedMsg.title += ' ('+totalPlayers+')'
    msg2send.content = null
    msg2send.embeds = [embedMsg]
  }
  return msg2send
}
