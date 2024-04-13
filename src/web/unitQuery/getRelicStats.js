'use strict'
const {reqStats, gearColors, relicStats} = require("./unitInfo")
module.exports = (unit)=>{
  const stats = unit.stats
  const addStats = {}
  for(let i in relicStats){
    if(unit.relic.currentTier > 2){
      const baseStat = (stats.base[relicStats[i].id] || 0) + (stats.gear[relicStats[i].id] || 0) + (stats.mods[relicStats[i].baseId] || 0)
      if(unit.relic.currentTier>2 && baseStat > relicStats[i].base)
      addStats[i] = {
        nameKey: relicStats[i].nameKey,
        value: baseStat
      }
    }
  }
  for(let s in addStats){
    if(statEnum.pct[s]){
      addStats[s].value = numeral(addStats[s].value * 100).format("0.00")+"%"
    }else{
      addStats[s].value = numeral(addStats[s].value).format("0,0")
    }
  }
  let statsArray = Object.values(addStats)
  if(statsArray.length>0){
    statsArray = sorter([{column:"nameKey",order:"ascending"}],statsArray)
    return statsArray
  }else{
    return ([])
  }
}
