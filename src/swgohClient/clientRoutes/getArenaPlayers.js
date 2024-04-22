'use strict'
const getArenaPlayer = require('./getArenaPlayer');

module.exports = async({ players = [] })=>{
  let array = [], i = players.length
  while(i--) array.push(getArenaPlayer({ allyCode: players[i]?.allyCode?.toString(), playerId: players[i]?.playerId }))
  let res = await Promise.allSettled(array)
  return res?.filter(x=>x?.value?.playerId)?.map(x=>x?.value)
}
