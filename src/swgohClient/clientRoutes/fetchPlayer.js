'use strict'
const getPlayer = require('./getPlayer')
const cache = require('src/helpers/cache/player')

module.exports = async(opt = {})=>{
  let collection = opt.collection || 'playerCache'
  let data = await cache.get(collection, opt.playerId, +opt.allyCode, opt.projection)
  if(!data){
    let payload = { playerId: opt.playerId, allyCode: opt.allyCode }
    if(opt.playerId) delete playload.playerId
    data = await getPlayer(payload, { collection: collection }, true)
  }
  return data
}
