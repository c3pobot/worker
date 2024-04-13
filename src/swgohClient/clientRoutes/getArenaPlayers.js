'use strict'
const log = require('logger');
const getArenaPlayer = require('./getArenaPlayer');

module.exports = async(payload = { players: [] })=>{
  try{
    let array = [], i = payload.players.length
    while(i--) array.push(getArenaPlayer({ allyCode: payload.players[i]?.allyCode?.toString(), playerId: payload.players[i]?.playerId }))
    return await Promise.all(array)
  }catch(e){
    log.error(e)
  }
}
