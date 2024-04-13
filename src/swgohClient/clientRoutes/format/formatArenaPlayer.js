'use strict'
module.exports = (opt = {})=>{
  try{
    let obj = {
      allyCode: +opt.allyCode,
      playerId: opt.playerId,
      name: opt.name,
      poOffSet: opt.localTimeZoneOffsetMinutes,
      arena: {
        char: {
          rank: 0,
          squad: []
        },
        ship: {
          rank: 0,
          squad: []
        }
      },
      updated: Date.now()
    }
    if(opt.pvpProfile){
      let charObj = opt.pvpProfile.find(x=>x.tab === 1)
      let shipObj = opt.pvpProfile.find(x=>x.tab === 2)
      if(charObj){
        obj.arena.char.rank = charObj.rank || 0
        if(charObj.squad) obj.arena.char.squad = charObj.squad.cell || []
      }
      if(shipObj){
        obj.arena.ship.rank = shipObj.rank || 0
        if(shipObj.squad) obj.arena.ship.squad = shipObj.squad.cell || []
      }
    }
    return obj
  }catch(e){
    throw(e);
  }
}
