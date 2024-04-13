'use strict'
const log = require('logger')
const queryArenaPlayer = require('./queryArenaPlayer')

module.exports = async(players = [], detailsOnly = false)=>{
  try{
    let array = [], res = [], i = players.length
    const fetchPlayer = async(payload = {})=>{
      let data = await queryArenaPlayer(payload, detailsOnly)
      if(data?.allyCode) res.push(data)
    }
    while(i--) array.push(fetchPlayer({ playerId: players[i].playerId, allyCode: players[i].allyCode }))
    await Promise.all(array)
    return res
  }catch(e){
    log.error(e);
  }
}
