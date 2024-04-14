'use strict'
const mongo = require('mongoclient')
const { GetGuild } = require('src/helpers/discordmsg')
const { getOptValue } = require('src/helpers')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'You did not provide a shard number'}, shards
  let id = getOptValue(opt, 'id')
  if(id) id = +id
  if(id >= 0){
    msg2send.content = 'There are no payout servers on shard **'+id+'**'
    shards = await mongo.find('payoutServers', {shard: id})
  }
  if(shards?.length > 0){
    let embedMsg = {
      title: 'Payout Servers Shard '+shards[0].shard+' Info',
      color: 15844367,
      fields: []
    }
    let playerCount = 0
    for(let i in shards){
      let guild = await GetGuild(shards[i].sId)
      let pCount = await mongo.count('shardPlayers', {shardId: shards[i]._id})
      playerCount += +pCount || 0
      let tempObj = {
        name: guild.name,
        value: '```\n'
      }
      tempObj.value += 'ID      : '+shards[i]._id+'\n'
      tempObj.value += 'sId     : '+shards[i].sId+'\n'
      tempObj.value += 'catId   : '+shards[i].catId+'\n'
      tempObj.value += 'type    : '+shards[i].type+'\n'
      tempObj.value += 'players : '+players.length+'\n'
      tempObj.value += '```'
      embedMsg.fields.push(tempObj)
    }
    embedMsg.title += ' ('+playerCount+')'
    msg2send.content = null
    msg2send.embeds = [embedMsg]
  }
  return msg2send
}
