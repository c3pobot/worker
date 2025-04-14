'use strict'
const swgohClient = require('src/swgohClient')

const getArenaPlayer = async(player = {})=>{
  if(!player.id) return
  let allyCode = await swgohClient.post('getAllyCode', { playerId: player.id })
  if(!allyCode) return
  return { ...player,...{ allyCode: allyCode } }
}

module.exports = async( players = [])=>{
  if(!players || players?.length == 0) return
  let array = [], i = players.length
  while(i--) array.push(getArenaPlayer({ id: players[i].id, name: players[i].name, rank: players[i].pvpStatus?.rank }))
  let res = await Promise.allSettled(array)
  return res?.filter(x=>x?.value?.allyCode)?.map(x=>x?.value)
}
