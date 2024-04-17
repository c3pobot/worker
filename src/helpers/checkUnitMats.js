'use strict'
const getNeededGear = require('./getNeededGear')
const getNeededRelicMats =  require('./getNeededRelicMats')
const getRelicMats = (unit = {}, relicRecipe = [], res = {}, inventory = [])=>{
  let neededRelicMats = getNeededRelicMats([], relicRecipe.filter(x=>(unit.reqRelic - 2) >= x.tier), (unit.relic - 2) || 0, unit.reqRelic - 2)
  for(let i in neededRelicMats){
    if(neededRelicMats[i]?.count > 0){
      if(!res[neededRelicMats[i].id]){
        res[neededRelicMats[i].id] = JSON.parse(JSON.stringify(neededRelicMats[i]))
        res[neededRelicMats[i].id].count = 0
        if(inventory?.length > 0){
          let item = inventory.find(x=>x.id === neededRelicMats[i].id)
          if(item?.quantity) res[neededRelicMats[i].id].inventory = item.quantity
        }
      }
      res[neededRelicMats[i].id].count += neededRelicMats[i].count
    }
  }
}
const getGear = async(unit, res, inventory = [])=>{
  let reqGear = 13
  if(unit.reqGear) reqGear = unit.reqGear
  let neededGear = await getNeededGear([], unit.equipment, gameData.unitData[unit.baseId]?.gearLvl, unit.gear, reqGear)
  for(let i in neededGear){
    if(neededGear[i]?.count > 0){
      if(!res[neededGear[i].id]){
        res[neededGear[i].id] =  JSON.parse(JSON.stringify(neededGear[i]))
        neededGear[i].count = 0
        if(inventory?.length > 0){
          let item = inventory.find(x=>x.id === neededGear[i].id)
          if(item?.quantity) res[neededGear[i].id].inventory = item.quantity
        }
      }
      res[neededGear[i].id].count += neededGear[i].count
    }
  }
}
module.exports = async(units = [], relicRecipe = [], inventory)=>{
  let res = {relicMats: {}, gear: {}}
  for(let i in units){
    if(units[i].combatType === 2) continue;
    if(units[i].reqRelic > 2 && units[i].reqRelic > units[i].relic) getRelicMats( units[i], relicRecipe, res.relicMats, inventory?.material )
    if((units[i].reqGear > 0 && units[i].reqGear > units[i].gear) || (units[i].reqRelic > 2 && units[i].gear < 13)) await getGear( units[i], res.gear, inventory?.equipment )
  }
  return res
}
