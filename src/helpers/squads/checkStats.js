'use strict'
const numeral = require('numeral')
const { pct } = require('../enum')
const enumStats = {'14': 21, '15': 22, '37': 52, '39': 35}
const specialStats = require('./specialStats')

module.exports = (squadStats, unitStats, combatType)=>{
  const stats = []
  for(let i in squadStats){
    const tempObj = {
      nameKey: squadStats[i].nameKey,
      pct: false,
      id: +squadStats[i].id,
      min: +squadStats[i].min,
      notMet: 0
    }
    if(squadStats[i].max) tempObj.max = +squadStats[i].max
    if(+squadStats[i].id >= 2000 && specialStats[squadStats[i].id]){
      specialStats[squadStats[i].id](unitStats, squadStats[i], tempObj)
    }else{
      if(enumStats[squadStats[i].id] && combatType == 1){
        tempObj.stat = ((+unitStats.base[squadStats[i].id] || 0) + (+unitStats.gear[squadStats[i].id] || 0) + (+unitStats.mods[enumStats[squadStats[i].id]] || 0))
        if(pct[enumStats[squadStats[i].id]]){
          tempObj.pct = true
          tempObj.stat = tempObj.stat * 100
        }
      }else{
        if(combatType == 1){
          tempObj.stat = (+unitStats.base[squadStats[i].id] || 0) + (+unitStats.gear[squadStats[i].id] || 0) + (+unitStats.mods[squadStats[i].id] || 0)
        }else{
          tempObj.stat = (+unitStats.base[squadStats[i].id] || 0) + (+unitStats.crew[squadStats[i].id] || 0)
        }
        if(pct[squadStats[i].id]) {
          tempObj.pct = true
          tempObj.stat = tempObj.stat * 100
        }
      }
    }
    if(tempObj.stat < +squadStats[i].min) tempObj.notMet++
    if(squadStats[i].max && +squadStats[i].max < tempObj.stat) tempObj.notMet++
    if(tempObj.pct == true){
      tempObj.min += '%'
      tempObj.stat = numeral(tempObj.stat).format('0.00')+'%'
      if(tempObj.max) tempObj.max += '%'
    }
    stats.push(tempObj)
  }
  return stats
}
