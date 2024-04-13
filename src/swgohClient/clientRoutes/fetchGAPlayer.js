'use strict'
const log = require('logger');
const getPlayer = require('./getPlayer');
const cache = require('../cache/player');
const { WebHookMsg } = require('helpers/discordmsg')

module.exports = async(opt = {})=>{
  try{
    let payload = {}
    if(opt.id > 999999){
      payload.allyCode = +opt.id
    }else{
      payload.playerId = opt.id
    }
    let data = await cache.get('gaCache', `${opt.id}-${opt.opponent}`, null, opt.projection)
    if(!data){
      if(opt.token) webHookMsg(opt.token, { content: 'Pulling new data...'}, 'PATCH')
      data = await getPlayer(payload, { collection: 'playerCache', projection: opt.projection })
      if(data){
        data.opponent = +opt.opponent
        cache.set('gaCache', `${opt.id}-${opt.opponent}`, JSON.stringify(data))
      }
    }
    return data
  }catch(e){
    log.error(e)
  }
}
