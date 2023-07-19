'use strict'
const { configMaps } = require('../configMaps')
const getFakeUnit = require('../getFakeUnit')
const AddRequirement = (obj = {}, type, value)=>{
  try{
    if(type && value){
      if(!obj.requirement){
        obj.requirement = type+''+value
      }else{
        obj.requirement += '<br>'+type+''+value
      }
    }
  }catch(e){
    throw(e);
  }
}
module.exports = (units = [], roster = {}, combatType = 3, foundUnits = [], foundFactionUnits = [])=>{
  try{
    let res = [], len = units.length, i = 0
    while(i < len){

      if(!configMaps?.UnitMap[units[i].baseId] || foundUnits.filter(x=>x.baseId === units[i].baseId).length > 0 || foundFactionUnits.filter(x=>x.baseId === units[i].baseId).length > 0){
        ++i
        continue
      }
      if(combatType !== 3 && configMaps.UnitMap[units[i].baseId].combatType === combatType){
        ++i
        continue
      }
      let unit = roster[units[i].baseId]
      if(!unit) unit = getFakeUnit(units[i].baseId)
      if(!unit) continue;
      unit.notMet = 0
      if(units[i].rarity > 1) unit.reqRarity = +units[i].rarity
      if(units[i].gp) unit.reqGP = +units[i].gp
      if(unit.combatType === 1 && units[i]?.gear?.value > 1){
        if(units[i].gear.name == 'gear') unit.reqGear = +units[i].gear.value
        if(units[i].gear.name == 'relic') unit.reqRelic = +units[i].gear.value - 2
      }
      if(unit.reqRarity && unit.rarity < unit.reqRarity) unit.notMet++
      if(unit.reqGear && unit.gearTier < unit.reqGear) unit.notMet++
      if(unit.reqRelic && unit.relicTier < unit.reqRelic) unit.notMet++
      if(unit.reqRarity && unit.reqRarity > 1) AddRequirement(unit, unit.reqRarity.toString(), '*')
      if(unit.reqRelic){
        AddRequirement(unit, 'R', (+unit.reqRelic - 2).toString())
      }else{
        if(unit.reqGear) AddRequirement(unit, 'G', unit.reqGear.toString())
      }
      res.push(unit)
      ++i
    }
    return res
  }catch(e){
    throw(e);
  }
}
