'use strict'
const playerIdCache = require('src/helpers/cache/playerId')
const queryArenaPlayer = require('./queryArenaPlayer')

module.exports = async( opt = {} )=>{
  let data = await playerIdCache.get(opt.playerId)
  if(!data?.allyCode) data = await queryArenaPlayer({ playerId: opt.playerId }, true)
  if(data?.allyCode) return +data?.allyCode
}
