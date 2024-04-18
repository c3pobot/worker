'use strict'
const mongo = require('mongoclient')
const { addPlayer } = require('./helper')
const { checkShardAdmin, getOptValue } = require('src/helpers')

module.exports = async(obj = {}, shard ={}, opt = [])=>{
  let auth = +shard.allowAll || 0, msg2send = {content: 'Editing players requires admin permissions'}, shardPlayer
  if(!auth) auth = await checkShardAdmin(obj, shard)
  if(!auth) return msg2send
  msg2send.content = 'You did not provide the correct information'
  let allyCode = getOptValue(opt, 'allycode')
  if(allyCode) allyCode = +allyCode.replace(/-/g, '')
  let emoji = getOptValue(opt, 'emoji')
  if(allyCode){
    allyCode = allyCode.toString().replace(/-/g, '').trim()
    shardPlayer = (await mongo.find('shardPlayers', {_id: allyCode+'-'+shard._id}))[0]
  }
  if(shardPlayer){
    if(emoji){
      await mongo.set('shardPlayers', {_id: allyCode+'-'+shard._id}, {emoji: emoji})
      await mongo.set('shardRankCache', {_id: allyCode+'-'+shard._id}, {emoji: emoji})
    }else{
      await mongo.unset('shardPlayers', {_id: allyCode+'-'+shard._id}, {emoji: shardPlayer.emoji})
      await mongo.unset('shardRankCache', {_id: allyCode+'-'+shard._id}, {emoji: shardPlayer.emoji})
    }
    msg2send.content = 'Player with allyCode **'+allyCode+'** was updated to have '+(emoji ? 'emoji '+emoji:'no emoji')
  }else{
    msg2send.content = 'Could not find shard player with allyCode **'+allyCode+'**'
  }
  return msg2send
}
