'use strict'
module.exports = (player = {}, data = {})=>{
  try{
    data.gp += player.gp
    data.gpChar += player.gpChar
    data.gpShip += player.gpShip
    if(!player.summary) return
    data.zeta += player.summary.zeta
    for(let i in player.summary.relic) data.relic[i] += player.summary.relic[i];
    for(let i in player.summary.omi) data.omi[i] += player.summary.omi[i];
    for(let i in player.summary.mod) data.mod[i] += player.summary.mod[i];
    for(let i in player.summary.gear) data.gear[i] += player.summary.gear[i];
    for(let i in player.summary.gl){
      if(!data.gl[i]) data.gl[i] = 0
      data.gl[i] += player.summary.gl[i]
    }
    for(let i in player.summary.rarity[1]) data.rarity[1][i] += player.summary.rarity[1][i]
    for(let i in player.summary.rarity[2]) data.rarity[2][i] += player.summary.rarity[2][i];
    data.dataCron.total = player.summary.dataCron.total
    for(let i in player.summary.dataCron){
      if(i === 'total') continue
      if(!data.dataCron[i]) data.dataCron[i] = {}
      for(let s in player.summary.dataCron[i]){
        if(!data.dataCron[i][s]) data.dataCron[i][s] = 0
        data.dataCron[i][s] += player.summary.dataCron[i][s]
      }
    }
    for(let i in player.summary.quality) data.quality[i] += player.summary.quality[i]
  }catch(e){
    throw(e)
  }
}
