'use strict'
const formatWebUnit = require('./formatWebUnit')
const numeral = require('numeral')
module.exports = (unit = null, uInfo) => {
  let obj = formatWebUnit(unit, uInfo)
  if(obj){
    obj.stats = {
      speed: 0,
      health: 0,
      protection: 0,
      pd: 0,
      sd: 0
    }
    if(unit?.stats){
      if(uInfo.combatType == 1){
        obj.stats.speed = (+unit.stats.base[5] || 0) + (+unit.stats.gear[5] || 0) + (+unit.stats.mods[5] || 0)
        obj.stats.health = numeral((+unit.stats.base[1] || 0) + (+unit.stats.gear[1] || 0) + (+unit.stats.mods[1] || 0)).format('0,0')
        obj.stats.protection = numeral((+unit.stats.base[28] || 0) + (+unit.stats.mods[28] || 0)).format('0,0')
        obj.stats.pd = numeral((+unit.stats.base[6] || 0) + (+unit.stats.gear[6] || 0) + (+unit.stats.mods[6] || 0)).format('0,0')
        obj.stats.sd = numeral((+unit.stats.base[7] || 0) + (+unit.stats.gear[7] || 0) + (+unit.stats.mods[7] || 0)).format('0,0')
      }else{
        obj.stats.speed = (+unit.stats.base[5] || 0) + (+unit.stats.crew[5] || 0)
        obj.stats.health = numeral((+unit.stats.base[1] || 0) + (+unit.stats.crew[1] || 0)).format('0,0')
        obj.stats.protection = numeral((+unit.stats.base[28] || 0) + (+unit.stats.crew[28] || 0)).format('0,0')
        obj.stats.pd = numeral((+unit.stats.base[6] || 0) + (+unit.stats.crew[6] || 0)).format('0,0')
        obj.stats.sd = numeral((+unit.stats.base[7] || 0) + (+unit.stats.crew[7] || 0)).format('0,0')
      }
    }
  }
  return obj
}
