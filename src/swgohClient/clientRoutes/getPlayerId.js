'use strict'
const playerIdCache = require('src/helpers/cache/playerId')
const queryArenaPlayer = require('./queryArenaPlayer')

module.exports = async({playerId, allyCode})=>{
  if(playerId) return playerId
  let data = await playerIdCache.get(null, allyCode)
  if(!data?.playerId) data = await queryArenaPlayer({ allyCode: allyCode?.toString() }, true)
  return data?.playerId
}
