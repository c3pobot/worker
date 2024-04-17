'use strict'
const getArenaPlayer = require('./getArenaPlayer');

module.exports = async(payload = { players: [] })=>{
  let array = [], i = payload.players.length
  while(i--) array.push(getArenaPlayer({ allyCode: payload.players[i]?.allyCode?.toString(), playerId: payload.players[i]?.playerId }))
  return await Promise.all(array)
}
