'use strict'
const mongo = require('mongoclient')
const swgohClient = require('src/swgohClient')

const { addPlayer } = require('./helper')
const { checkShardAdmin } = require('src/helpers')

module.exports = async(obj = {}, shard = {}, opt = [])=>{
  let auth = +shard.allowAll || 0
  if(!auth) auth = await checkShardAdmin(obj, shard)
  if(!auth) return { content: 'Adding players requires admin permissions' }

  let players = await mongo.find('shardPlayers', { _id: {$regex: shard._id } }, { allyCode: 1, name: 1 }) || []
  if(players?.length >= shard.shardLimit) return { content: 'You are limited to **'+shard.shardLimit+'** registered shard players. You currently have **'+players.length+'**' }

  let allyCode = opt.allycode?.value?.toString()?.trim()?.replace(/-/g, ''), emoji = opt.emoji?.value
  if(!allyCode) return { content: 'You did not provide an allyCode' }

  let dObj = players.find(x=>x?.allyCode === +allyCode)
  if(dObj?.name) return { content: '**'+dObj?.name+'** has already been added to the shard' }

  let pObj = await swgohClient.post('getArenaPlayer', { allyCode: allyCode?.toString() }, null)
  if(!pObj?.allyCode) return { content: 'Error finding player with allyCode **'+allyCode+'**' }

  let status = await addPlayer(shard, pObj, emoji)
  if(!status) return { content: `Error adding ${pObj.name} to the shard list` }

  return { content: '**'+pObj.name+'** with allyCode **'+pObj.allyCode+'** was added '+(emoji ? 'with emoji '+emoji+' ':'')+' to the shard list' }
}
