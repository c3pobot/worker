'use strict'
const log = require('logger')
const getPlayer = require('./getPlayer')
const cache = require('../cache/player')
const { WebHookMsg } = require('helpers/discordmsg')

module.exports = async(opt = {})=>{
  try{
    let collection = opt.collection || 'playerCache'
    let data = await cache.get(collection, opt.playerId, +opt.allyCode, opt.projection)
    if(!data){
      let payload = { playerId: opt.playerId, allyCode: opt.allyCode }
      if(opt.playerId) delete playload.playerId
      if(opt.token) webHookMsg(opt.token, { content: 'Pulling new data...'}, 'PATCH')
      data = await getPlayer(payload, { collection: collection }, true)
    }
    return data
  }catch(e){
    throw(e)
  }
}
