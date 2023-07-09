'use strict'
module.exports = (player = {}, data = {})=>{
  try{
    data.gp += player.gp
    data.gpChar += player.gpChar
    data.gpShip += player.gpShip
    data.zeta += player.summary.zeta
    for(let i in player.summary.relic){
      if(!data.relic[i]) data.relic[i] = 0
      data.relic[i] += player.summary.relic[i]
    }
    for(let i in player.summary.omi){
      if(!data.omi[i]) data.omi[i] = 0
      data.omi[i] += player.summary.omi[i]
    }
    for(let i in player.summary.mod){
      if(!data.mod[i]) data.mod[i] = 0
      data.mod[i] += player.summary.mod[i]
    }
    for(let i in player.summary.gl){
      if(!data.gl[i]) data.gl[i] = 0
      data.gl[i] += player.summary.gl[i]
    }
    data.dataCron.total = player.summary.dataCron.total
    for(let i in player.summary.dataCron){
      if(i === 'total') continue
      if(!data.dataCron[i]) data.dataCron[i] = {}
      for(let s in player.summary.dataCron[i]){
        if(!data.dataCron[i][s]) data.dataCron[i][s] = 0
        data.dataCron[i][s] += player.summary.dataCron[i][s]
      }
    }
  }catch(e){
    throw(e)
  }
}
