'use strict'
const numeral = require('numeral')
const getStat = (stat = {}, unit = {})=>{
  try{
    let format = '0,0'
    if(stat.pct){
      format = '0.0'
      if(stat.id === 14 || stat.id === 15) format = '0.00'
    }
    let str = numeral(stat.final || 0).format(format)
    if(unit.combatType === 1  && stat.mods) str += ' ('+numeral(stat.mods || 0).format(format)+')'
    if(unit.combatType === 2 && stat.crew) str += ' ('+numeral(stat.crew || 0).format(format)+')'
    if(stat.pct) str += '%'
    return str
  }catch(e){
    throw(e)
  }
}
module.exports = (unit = {}, array = []) =>{
  try{
    let str = getStat(unit.stats[array[0]], unit), i = 1, len = array.length
    while( i < len){
      str += '<br>'+getStat(unit.stats[array[i]], unit)
      ++i
    }
    return str
  }catch(e){
    throw(e);
  }
}
