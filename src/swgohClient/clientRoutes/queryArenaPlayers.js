'use strict'
const log = require('logger')
const queryArenaPlayer = require('./queryArenaPlayer')

const fetchPlayer = async(payload = {})=>{
  let data = await queryArenaPlayer(payload, detailsOnly)
  if(data?.allyCode) res.push(data)
}

module.exports = async({players = [], detailsOnly = false})=>{
  let array = [], i = players.length
  while(i--) array.push(queryArenaPlayer({ playerId: players[i].playerId, allyCode: players[i].allyCode }, detailsOnly))
  let res = await Promise.allSettled(array)
  return res?.filter(x=>x?.value?.allyCode)?.map(x=>x?.value)
}
