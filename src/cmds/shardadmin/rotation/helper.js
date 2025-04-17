'use strict'
const mongo = require('mongoclient')
const swgohClient = require('src/swgohClient')
const { getDiscordAC, getPOHour, getRotation } = require('src/helpers')
const { getGuildMember, sendMsg } = require('src/helpers/discordmsg')
const addShardPlayer = async(shard = {}, allyCode)=>{
  let pObj = await swgohClient.post('getArenaPlayer', {allyCode: allyCode}, null)
  if(pObj && pObj.allyCode){
    pObj.shardId = shard._id
    pObj.catId = shard.catId
    pObj.emoji = null
    pObj.sId = shard.sId
    pObj.notify = {
      status: 0,
      method: 'log',
      startTime: 24,
      poMsg: 0,
      altStatus: 0
    }
    let tempObj = {
      allyCode: +pObj.allyCode,
      catId: shard.catId,
      shardId: shard._id,
      sId: shard.sId,
      alt: shard.alt,
      arena: pObj.arena,
      emoji: null,
      history: {
        char: {
          rank: [],
          po: []
        },
        ship: {
          rank: [],
          po: []
        }
      },
      name: pObj.name,
      notify: {
        start: 0,
        altStart: 0,
        poNotify: 0,
        poNotifyAlt: 0
      },
      playerId: pObj.playerId,
      poOffSet: pObj.poOffSet,
      rank: (pObj.arena[shard.type] ? +pObj.arena[shard.type].rank:0),
      ranks: {
        char:{
          newRank: (pObj.arena.char ? +pObj.arena.char.rank:0),
          oldRank: 0
        },
        ship:{
          newRank: (pObj.arena.char ? +pObj.arena.ship.rank:0),
          oldRank: 0
        }
      },
      type: shard.type
    }
    delete pObj.arena
    await mongo.set('shardRankCache', {_id: pObj.allyCode+'-'+shard._id}, tempObj)
    await mongo.set('shardPlayers', {_id: pObj.allyCode+'-'+shard._id}, pObj)
  }
}
const Cmds = {}
Cmds.forceMessage = (rObj = {})=>{
  let poHour = getPOHour(rObj.poOffSet, rObj.type)
  if(rObj.notifyStart > 0 && poHour < 23){
    let newFirst = rObj.players.pop()
    rObj.players.unshift(newFirst)
  }
  let msg2Send = getRotation(rObj)
  sendMsg({chId: rObj.chId, sId: rObj.sId}, { content: msg2Send })
}
Cmds.getPlayers = async(shard = {}, pArray = [])=>{
  let res = { players: [] }
  for(let i in pArray){
    pArray[i] = pArray[i].trim()
    let pObj, cachePlayer, nPlayer = {}
    if(pArray[i].replace(/-/g, '') > 999999 || pArray[i].startsWith('<@')){
      if(pArray[i].startsWith('<@')){
        pObj = (await mongo.find('shardPlayers', {dId: pArray[i].replace(/[<@!>]/g, ''), shardId: shard._id}))[0]
        if(!pObj){
          let dObj = await getDiscordAC(pArray[i].replace(/[<@!>]/g, ''))
          if(dObj && dObj.allyCode){
            pObj = (await mongo.find('shardPlayers', {_id: dObj.allyCode+'-'+shard._id}))[0]
            if(!pObj){
              await addShardPlayer(shard, dObj.allyCode)
              pObj = (await mongo.find('shardPlayers', {_id: dObj.allyCode+'-'+shard._id}))[0]
            }
          }
        }
        if(pObj){
          let user = await getGuildMember(shard.sId, pArray[i].replace(/[<@!>]/g, ''))
          if(user){
            nPlayer.name = (user.nick ? user.nick:user.user.username)
            nPlayer.discord = '<@'+user.user.id+'>'
          }
        }
      }
      if(pArray[i].replace(/-/g, '') > 999999){
        pObj = (await mongo.find('shardPlayers', {_id: pArray[i].replace(/-/g, '')+'-'+shard._id}))[0]
        if(!pObj){
          await addShardPlayer(shard, pArray[i].replace(/-/g, ''))
          pObj = (await mongo.find('shardPlayers', {_id: pArray[i].replace(/-/g, '')+'-'+shard._id}))[0]
        }
        if(pObj){
          let tempCache = (await mongo.find('shardRankCache', {_id: pObj._id}))[0]
          if(tempCache && tempCache.name){
            nPlayer.name = pObj.name
            if(pObj.dId) nPlayer.discord = '<@'+pObj.dId+'>'
          }
        }
      }
    }else{
      nPlayer.name = pArray[i].toLowerCase()
      res.players.push({name: pArray[i].toLowerCase()})
    }
    if(pObj) cachePlayer = (await mongo.find('shardRankCache', {_id: pObj._id}))[0]
    if(pObj && cachePlayer && (cachePlayer.poOffSet || cachePlayer.poOffSet == 0) && (!res.poOffSet || res.poOffSet != 0)) res.poOffSet = cachePlayer.poOffSet
    if(cachePlayer && !nPlayer.name) nPlayer.name = cachePlayer.username
    if(nPlayer.name) res.players.push(nPlayer)
  }
  return res
}
module.exports = Cmds
