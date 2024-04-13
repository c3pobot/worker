'use strict'
const getPlayerAC = require('./getPlayerAC')
const swgohClient = require('src/swgohClient')
module.exports = async(obj = {}, opt = [])=>{
  let res = await getPlayerAC(obj, opt)
  if(!res.playerId && res.allyCode){
    let player = await swgohClient.post('playerArena', {allyCode : res.allyCode.toString(), playerDetailsOnly: true})
    res.playerId = player?.playerId
  }
  return res
}
