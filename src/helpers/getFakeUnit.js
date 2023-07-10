'use strict'
const log = require('logger')
const { configMaps } = require('helpers/configMaps')
const deepCopy = require('./deepCopy')
const fakeUnit = {
  gp: 0,
  level: 0,
  zetaCount: 0,
  omiCount: 0,
  relicTier: 0,
  rarity: 0,
  skill: {},
  gearTier: 0,
  stats: {}
}
const generateFakeStats = ()=>{
  try{
    if(configMaps?.StatsMap[1]){
      let s = 99
      while(s--){
        fakeUnit.stats[s] = { id: +s, base: 0, mods: 0, crew: 0, final: 0, nameKey: configMaps.StatsMap[s]?.nameKey, pct: configMaps.StatsMap[s]?.pct }
      }
    }else{
      setTimeout(generateFakeStats, 5000)
    }
  }catch(e){
    log.error(e);
    setTimeout(generateFakeStats, 5000)
  }
}
generateFakeStats()
module.exports = (baseId)=>{
  try{
    if(!baseId || !configMaps?.UnitMap[baseId]) return
    let unit = deepCopy(configMaps?.UnitMap[baseId])
    let tempUnit = deepCopy(fakeUnit)
    unit = {...unit,...tempUnit}
    return unit
  }catch(e){
    throw(e);
  }
}
