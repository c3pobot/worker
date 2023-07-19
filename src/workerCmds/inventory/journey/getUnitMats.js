'use strict'
const { mongo, DeepCopy, GetNeededGear, GetNeededRelicMats } = require('helpers')
const GetRelicMats = (unit = {}, relicRecipe = [], res = {}, inventory = [])=>{
  try{
    let neededRelicMats = GetNeededRelicMats([], relicRecipe.filter(x=>unit.reqRelic >= x.tier), unit.relicTier || 0)
    if(!neededRelicMats) return
    for(let i in neededRelicMats){
      if(neededRelicMats[i]?.count > 0){
        if(!res[neededRelicMats[i].id]){
          res[neededRelicMats[i].id] = DeepCopy(neededRelicMats[i])
          res[neededRelicMats[i].id].count = 0
          let item = inventory.find(x=>x.id === neededRelicMats[i].id)
          res[neededRelicMats[i].id].inventory = +item?.quantity || 0
        }
        res[neededRelicMats[i].id].count += neededRelicMats[i].count
      }
    }
  }catch(e){
    throw(e);
  }
}
const GetGear = async(unit = {}, res = {}, inventory = [], gearLvl = {})=>{
  try{
    let reqGear = 13
    if(unit.reqGear) reqGear = unit.reqGear
    let neededGear = await GetNeededGear(inventory, unit.equipment, gearLvl, unit.gearTier, reqGear)
    if(!neededGear) return
    for(let i in neededGear){
      if(neededGear[i]?.count > 0){
        if(!res[neededGear[i].id]){
          res[neededGear[i].id] = DeepCopy(neededGear[i])
          res[neededGear[i].id].count = 0
        }
        res[neededGear[i].id].count += neededGear[i].count
      }
    }
  }catch(e){
    throw(e);
  }
}
module.exports = async(units = [], relicRecipe = [], inventory = {})=>{
  try{
    let res = { relicMats: {}, gear: {} }
    let unitIds = units.map(x=>x.baseId)
    let equipmentList = await mongo.find('unitList', {_id: { $in: unitIds}}, { baseId: 1, gear: 1})
    if(!equipmentList) throw('Error getting equipmentList..')
    for(let i in units){
      if(units[i].combatType === 2) continue;
      if(units[i].reqRelic > 0 && units[i].reqRelic > units[i].relicTier) GetRelicMats( units[i], relicRecipe, res.relicMats, inventory?.material )
      if((units[i].reqGear > 0 && units[i].reqGear > units[i].gearTier) || (units[i].reqRelic > 0 && units[i].gearTier < 13)) await GetGear( units[i], res.gear, inventory?.equipment, equipmentList.find(x=>x.baseId === units[i].baseId)?.gear )
    }
    return res
  }catch(e){
    throw(e);
  }
}
