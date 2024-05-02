'use strict'
const processAPIRequest = require('../processAPIRequest');
const guildIdCache = require('src/helpers/cache/guildId')

module.exports = async({ guildId, allyCode, playerId, skipCache = false })=>{
  if(guildId) return guildId
  if(allyCode){
    let pObj = await guildIdCache.get(null, allyCode)
    if(!pObj || skipCache) pObj = await processAPIRequest('player', { allyCode: allyCode.toString() })
    return pObj?.guildId
  }
  if(playerId){
    let pObj = await guildIdCache.get(playerId)
    if(!pObj || skipCache) pObj = await processAPIRequest('player', { playerId: playerId })
    return pObj?.guildId
  }
}
