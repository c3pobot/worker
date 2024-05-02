'use strict'
const mongo = require('mongoclient')

const { addPlayer } = require('./helper')
const { checkShardAdmin } = require('src/helpers')

module.exports = async(obj = {}, shard ={}, opt = {})=>{
  let auth = +shard.allowAll || 0
  if(!auth) auth = await checkShardAdmin(obj, shard)
  if(!auth) return { content: 'Editing players requires admin permissions' }

  let allyCode = opt.allycode?.value?.toString()?.trim()?.replace(/-/g, ''), emoji = opt.emoji?.value
  if(!allyCode) return { content: 'you did not provide an allyCode' }

  let shardPlayer = (await mongo.find('shardPlayers', { _id: allyCode+'-'+shard._id }))[0]
  if(!shardPlayer?.allyCode) return { content: 'Player with allyCode **'+allyCode+'** is not part of the shard list' }

  await mongo.set('shardPlayers', {_id: allyCode+'-'+shard._id}, { emoji: emoji })
  await mongo.set('shardRankCache', {_id: allyCode+'-'+shard._id}, { emoji: emoji })
  return { content: 'Player with allyCode **'+allyCode+'** was updated to have '+(emoji ? 'emoji '+emoji:'no emoji') }
}
