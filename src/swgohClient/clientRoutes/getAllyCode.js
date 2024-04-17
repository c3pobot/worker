'use strict'
const cache = require('../cache/player')
const queryArenaPlayer = require('./queryArenaPlayer')

module.exports = async( opt = {} )=>{
  let data = await cache.get('playerCache', opt.playerId, null, { allyCode: 1 })
  if(!data) data = await queryArenaPlayer({ playerId: opt.playerId }, true)
  if(data?.allyCode) return +data?.allyCode
}
