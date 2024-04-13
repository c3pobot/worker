'use strict'
const getModIndex = require('./getModIndex')
module.exports = (stats = {}, statInfo = {})=>{
  let pri = 0, sec = 0
  pri += (stats.base[statInfo.pri.id] || 0) + (stats.gear[statInfo.pri.id] || 0) + (stats.mods[getModIndex(statInfo.pri.id)] || 0)
  sec += (stats.base[statInfo.sec.id] || 0) + (stats.gear[statInfo.sec.id] || 0) + (stats.mods[getModIndex(statInfo.sec.id)] || 0)
  if(pri >= sec) return(statInfo.pri)
  return(statInfo.sec)
}
