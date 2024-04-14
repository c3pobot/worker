'use strict'
const mongo = require('mongoclient')
const { getOptValue, getShardName, timeTillPayout } = require('src/helpers')

module.exports = async(obj = {}, shard = {}, opt = [])=>{
  let pObj, msg2send = {content: 'shard member not found'}, rankCache
  let dId = getOptValue(opt, 'user', obj.member?.user?.id)
  let allyCode = getOptValue(opt, 'allycode')?.toString()?.replace(/-/g, '')
  if(allyCode) pObj = (await mongo.find('shardPlayers', {_id: allyCode+'-'+shard._id}))[0]
  if(!allyCode && !pObj) pObj = (await mongo.find('shardPlayers', {dId: dId, shardId: shard._id}))[0]
  if(pObj){
    msg2send.content = 'No player rank cache'
    rankCache = (await mongo.find('shardRankCache', {_id: pObj._id}))[0]
  }
  if(rankCache){
    let watchObj = await mongo.find('shardWatch', {pId: pObj.allyCode+'-'+shard._id})
    let embedMsg = {
      color: 15844367,
      title: pObj.name+'\'s '+getShardName(shard)+' Arena Info',
      description: '```',
      timestamp: new Date()
    }
    embedMsg.description += 'allyCode         : '+pObj.allyCode
    if(pObj.emoji) embedMsg.description += '\nEmoji            : '+pObj.emoji
    if(rankCache) embedMsg.description += '\nSquad Arena Rank : '+(rankCache.arena ? rankCache.arena.char.rank : 0);
    embedMsg.description += '\nSquad Arena PO   : '+timeTillPayout(pObj.poOffSet, 'char')[0]
    if(rankCache) embedMsg.description += '\nFleet Arena Rank : '+(rankCache.arena ? rankCache.arena.ship.rank : 0)
    embedMsg.description += '\nFleet Arena PO   : '+timeTillPayout(pObj.poOffSet, 'ship')[0]
    if(pObj.notify.status > 0){
      embedMsg.description += '\nNotifications    : '+pObj.notify.method
      embedMsg.description += '\nNotif Start      : '+pObj.notify.startTime
      embedMsg.description += '\nPayout Notif     : '+(pObj.notify.poMsg > 0 ? 'on' : 'off')
      embedMsg.description += '\nAlt Arena Notif  : '+(pObj.notify.altStatus > 0 ? 'on' : 'off')
    }else{
      embedMsg.description += '\nNotifications    : off'
    }
    embedMsg.description += '```'
    if(watchObj && watchObj.length > 0){
      embedMsg.description += 'Active Rank watches\n```\n'
      for(let i in watchObj) embedMsg.description += watchObj[i].rank+'\n'
      embedMsg.description += '```'
    }
    msg2send.content = null
    msg2send.embeds = [embedMsg]
  }
  return msg2send
}
