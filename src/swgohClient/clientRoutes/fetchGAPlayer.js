'use strict'
const getPlayer = require('./getPlayer');
const cache = require('src/helpers/cache/player');
const getPlayerId = require('./getPlayerId')

module.exports = async(opt = {})=>{
  let playerId = await getPlayerId(opt)
  if(!playerId) return
  let data = await cache.get('gaCache', `${playerId}-${opt.opponent}`, null, opt.projection)
  if(!data) data = await getPlayer({ playerId: playerId })
  if(data && !data.opponent){
    data.opponent = +opt.opponent
    cache.set('gaCache', `${playerId}-${opt.opponent}`, JSON.stringify(data), false)
  }
  return data
}
