'use strict'
const mongo = require('mongoclient')
const swgohClient = require('src/swgohClient')

const { addPlayer } = require('./helper')
const { checkShardAdmin } = require('src/helpers')

module.exports = async(obj = {}, shard = {}, opt = {})=>{
  if(!obj?.member?.user?.id) return { content: 'there was an error with the provided data' }

  let allyCode = opt.allycode?.value?.toString()?.trim()?.replace(/-/g, '')
  if(!allyCode) return { content: 'you did not provide an allyCode' }

  let shardPlayer = (await mongo.find('shardPlayers', { _id: allyCode+'-'+shard._id }))[0]
  if(!shardPlayer?.allyCode) return { content: 'Player with allyCode **'+allyCode+'** is not part of the shard list' }

  await mongo.set('shardPlayers', { _id: allyCode+'-'+shard._id }, { dId: obj.member.user.id })
  return { content: 'allyCode '+allyCode+' has been linked to your discord id for shard notifications' }
}
