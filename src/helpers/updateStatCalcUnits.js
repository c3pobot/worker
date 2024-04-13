'use strict'
const updateStatCalcUnit = require('./updateStatCalcUnit')
module.exports = (player = {})=>{
  player.zetaCount = 0
  player.omiCount = {total: 0, tb: 0, tw: 0, gac: 0, conquest: 0}
  player.sixModCount = 0
  for(let i in player.rosterUnit){
    let stats = updateStatCalcUnit(player.rosterUnit[i])
    if(stats?.zetaCount) player.zetaCount += stats.zetaCount
    if(stats?.omiCount){
      player.omiCount.total += stats.omiCount.total
      player.omiCount.tb += stats.omiCount.tb
      player.omiCount.tw += stats.omiCount.tw
      player.omiCount.gac += stats.omiCount.gac
      player.omiCount.conquest += stats.omiCount.conquest
    }
    if(stats?.sixModCount) player.sixModCount += stats.sixModCount
  }
}
