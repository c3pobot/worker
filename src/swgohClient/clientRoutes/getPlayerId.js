'use strict'
const cache = require('src/helpers/cache/player')
const queryArenaPlayer = require('./queryArenaPlayer')

module.exports = async( opt = {} )=>{
  let data = await cache.get('playerCache', null, +opt.allyCode, { playerId: 1, allyCode: 1 })
  if(!data) data = await queryArenaPlayer({ allyCode: opt.allyCode?.toString() }, true)
  if(data?.playerId) return +data?.playerId
}
