'use strict'
const playerIdCache = require('src/helpers/cache/playerId')
const queryArenaPlayer = require('./queryArenaPlayer')

module.exports = async( opt = {} )=>{
  let data = await playerIdCache.get(null, opt.allyCode?.toString())
  if(data) return data
  data = await queryArenaPlayer({ allyCode: opt.allyCode?.toString() }, true)
  if(data?.playerId) return data?.playerId
}
