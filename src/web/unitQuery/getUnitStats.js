'use strict'
const {reqStats, gearColors, relicStats} = require("./unitInfo")
module.exports = (stats, combatType)=>{
  const obj = {}
  for(let x in reqStats){
    let i = reqStats[x]
    let finalStat = (stats.base[i] || 0)
    let modsStat = 0
    if(combatType == 1){
      finalStat += (stats.gear[i] || 0)
      if(i == 14 || i ==15){
        if(i == 14){
          modsStat += (stats.mods[21] || 0)
        }else{
          modsStat += (stats.mods[22] || 0)
        }
      }else{
        modsStat += (stats.mods[i] || 0)
      }
    }
    if(combatType == 2){
      modsStat += (stats.crew[i] || 0)
    }
    if(i == 14 || i == 15){
      obj[i] = numeral((finalStat + modsStat)*100).format('0.00')+(modsStat > 0 ? ' ('+numeral(modsStat*100).format('0.00')+')' : '')+'%'
    }else{
      if(statEnum.pct[i]){
        obj[i] = numeral((finalStat + modsStat)*100).format('0.0')+(modsStat > 0 ? ' ('+numeral(modsStat*100).format('0.0')+')' : '')+'%'
      }else{
        obj[i] = numeral(finalStat + modsStat).format('0,0')+(modsStat > 0 ? ' ('+numeral(modsStat).format('0,0')+')' : '')
      }
    }
  }
  return obj
}
