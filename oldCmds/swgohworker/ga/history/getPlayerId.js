'use strict'
const GetPlayerAC = require('./getPlayerAC')
module.exports = async(obj = {}, opt = [])=>{
  try{
    let res = await GetPlayerAC(obj, opt)
    if(!res.playerId && res.allyCode){
      const player = await Client.post('playerArena', {allyCode : res.allyCode.toString(), playerDetailsOnly: true})
      if(player?.playerId) res.playerId = player.playerId
    }
    return res
  }catch(e){
    console.error(e);
  }
}
