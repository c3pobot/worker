'use strict'
const { configMaps } = require('../configMaps')
const CheckUnits = require('./checkUnits')
const deepCopy = require('../deepCopy')
module.exports = (factions = [], roster = {}, foundUnits = [])=>{
  try{
    let res = [], len = factions.length, i = 0
    while(i < len){
      if(!configMaps?.FactionMap[factions[i].baseId]){
        ++i
        continue
      }
      let req = deepCopy(factions[i])
      let fUnits = configMaps.FactionMap[factions[i].baseId].units?.map(x=>({...req,...{ baseId: x } }))
      let units = CheckUnits(fUnits, roster, factions[i].combatType || 3, foundUnits, res)
      if(units?.length > 0){
        if(units?.filter(x=>x.notMet === 0).length >= factions[i].numUnits){
          res = res.concat(units?.filter(x=>x.notMet === 0))
        }else{
          res = res.concat(units)
        }
      }
      ++i
    }
    return res
  }catch(e){
    throw(e);
  }
}
