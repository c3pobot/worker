'use strict'
const getPlayer = require('./getPlayer');
const cache = require('../cache/player');

module.exports = async(opt = {})=>{
  let payload = {}
  if(opt.id > 999999){
    payload.allyCode = +opt.id
  }else{
    payload.playerId = opt.id
  }
  let data = await cache.get('gaCache', `${opt.id}-${opt.opponent}`, null, opt.projection)
  if(!data){
    data = await getPlayer(payload, { collection: 'playerCache', projection: opt.projection })
    if(data){
      data.opponent = +opt.opponent
      cache.set('gaCache', `${opt.id}-${opt.opponent}`, JSON.stringify(data))
    }
  }
  return data
}
