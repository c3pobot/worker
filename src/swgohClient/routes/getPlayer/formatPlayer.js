'use strict'
const getDataCronCount = (list = [])=>{
  try{
    let data = { total: 0 }
    for(let i in list){
      if(!data[list[i].setId]) data[list[i].setId] = { id: list[i].setId, total: 0 }
      if(!data[list[i].setId][list[i].affix.length]) data[list[i].setId][list[i].affix.length] = 0
      data[list[i].setId][list[i].affix.length]++
      data[list[i].setId].total++
      data.total++
    }
    return data
  }catch(e){
    throw(e)
  }
}
module.exports = (player = {}, stats = {})=>{
  try{
    player = {...player,...stats}
    player.allyCode = +player.allyCode
    player.arena = {
      char:{
        rank: '',
        squad: []
      },
      ship:{
        rank: '',
        squad: []
      }
    }
    if(player.summary) player.summary.dataCron = getDataCronCount(player.datacron)

    player.gp = +(player.profileStat.find(x=>x.index === 1)?.value || 0)
    player.gpChar = +(player.profileStat.find(x=>x.index === 2)?.value || 0)
    player.gpShip = +(player.profileStat.find(x=>x.index === 3)?.value || 0)
    if(player.pvpProfile){
      const charObj = player.pvpProfile.find(x=>x.tab === 1)
      const shipObj = player.pvpProfile.find(x=>x.tab === 2)
      if(charObj){
        player.arena.char.rank = charObj.rank || 0
        if(charObj.squad) player.arena.char.squad = charObj.squad.cell || []
      }
      if(shipObj){
        player.arena.ship.rank = shipObj.rank || 0
        if(shipObj.squad) player.arena.ship.squad = shipObj.squad.cell || []
      }
      delete player.pvpProfile;
    }
    return player
  }catch(e){
    throw(e)
  }
}
