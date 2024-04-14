'use strict'
const { addPlayer } = require('./helper')
const { checkShardAdmin, getOptValue } = require('src/helpers')
const swgohClient = require('src/swgohClient')

module.exports = async(obj = {}, shard = {}, opt = [])=>{
  let auth = +shard.allowAll || 0, msg2send = {content: 'Adding players requires admin permissions'}
  if(!auth) auth = await checkShardAdmin(obj, shard)
  if(!auth) return msg2send
  let playerCount = await mongo.find('shardPlayers', {shardId: shard._id}, {allyCode: 1, name: 1})
  if(playerCount?.length >= shard.shardLimit) return { content: 'You are limited to **'+shard.shardLimit+'** registered shard players. You currently have **'+playerCount.length+'**' }
  let allyCode = getOptValue(opt, 'allycode')
  let emoji = getOptValue(opt, 'emoji')
  if(allyCode){
    allyCode = allyCode.toString().replace(/-/g, '').trim()
    pObj = (await mongo.find('shardPlayers', {_id: allyCode+'-'+shard._id}))[0]
  }
  msg2send.content = '**'+pObj?.name+'** has already been added to the shard'
  if(!pObj && allyCode){
    msg2send.content = 'Error finding player with allyCode **'+allyCode+'**'
    pObj = await swgohClient.post('getArenaPlayer', {allyCode: allyCode}, null)
    if(pObj?.allyCode){
      await addPlayer(shard, pObj, emoji)
      msg2send.content = '**'+pObj.name+'** with allyCode **'+pObj.allyCode+'** was added '+(emoji ? 'with emoji '+emoji+' ':'')+' to the shard list'
    }
  }
  return msg2send
}
