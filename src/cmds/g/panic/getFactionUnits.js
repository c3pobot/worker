'use strict'
const { dataList } = require('src/helpers/dataList')

module.exports = (faction = {}, requiredUnits)=>{
  let units = [], req = { rarity: faction.rarity || 1, gp: faction.gp || 0, combatType: faction.combatType, gear: faction.gear }
  for(let i in faction.units){
    if(!faction.units[i]) continue
    let uInfo = dataList?.unitList[faction.units[i]]
    if(!uInfo.baseId) continue
    if(req.combatType !== uInfo.combatType) continue
    if(requiredUnits.has(uInfo.baseId)) continue
    units.push({...{ baseId: uInfo.baseId },...req})
  }
  return units
}
