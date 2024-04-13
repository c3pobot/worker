'use strict'
const numeral = require('numeral')
const sorter = require('json-array-sorter')
const { relicStats } = require('helpers/enum')
module.exports = (unit)=>{
  try{
    let stats = unit.stats
    let addStats = {}
    for(let i in relicStats){
      if(unit.relic.currentTier > 2 && stats.base){
        let baseStat = (stats.base[relicStats[i].id] || 0), modStat = 0, crewStat = 0
        if(stats.crew) crewStat = (stats.crew[relicStats[i].baseId] || 0)
        if(stats.mods) modStat = (stats.mods[relicStats[i].baseId] || 0)
        baseStat = baseStat + crewStat + modStat
        if(unit.relic.currentTier>2 && baseStat > relicStats[i].base)
        addStats[i] = {
          nameKey: relicStats[i].nameKey,
          value: baseStat
        }
      }
    }
    for(let s in addStats){
      if(HP.enum.pct[s]){
        addStats[s].value = numeral(addStats[s].value * 100).format("0.00")+"%"
      }else{
        addStats[s].value = numeral(addStats[s].value).format("0,0")
      }
    }
    let statsArray = Object.values(addStats)
    if(statsArray.length>0) statsArray = sorter([{column:"nameKey",order:"ascending"}],statsArray)
    return statsArray
  }catch(e){
    throw(e)
  }
}
