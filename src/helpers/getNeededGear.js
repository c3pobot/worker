'use strict'
const getGearParts = require('./getGearParts')
const sorter = require('json-array-sorter')
const GetGearParts = async(unequippedGear = [], inventory = [])=>{
  try{
    let tempGear = {}, gearObj = {}
    let i = unequippedGear.length
    while(i--) {
      if(!unequippedGear[i].count || unequippedGear[i].count === 0 || unequippedGear[i].id === '9999') continue;
      let gearParts = await getGearParts(unequippedGear[i].id, tempGear)
      if(!gearParts) continue;
      for (let a in gearParts) {
        if (!gearObj[gearParts[a].id]){
          let item = inventory.find(x=>x.id === gearParts[a].id)
          gearObj[gearParts[a].id] = {
            id: gearParts[a].id,
            count: 0,
            inventory: +item?.quantity || 0,
            tier: gearParts[a].tier,
            mark: gearParts[a].mark,
            nameKey: gearParts[a].nameKey,
            iconKey: gearParts[a].iconKey
          };
        }
        if (gearObj[gearParts[a].id]) gearObj[gearParts[a].id].count += (+gearParts[a].count * +unequippedGear[i].count || 1)
      }
    }
    return Object.values(gearObj)
  }catch(e){
    throw(e);
  }
}
module.exports = async(inventory = [], equipment = [], unitGear = {}, currentTier = 1, gearLevel = 13)=>{
  try{
    let neededGear = {}
    for(let i = +currentTier; i < gearLevel; i++){
      let tempUnitGear = unitGear[i]?.gear
      for (let g in tempUnitGear) {
        if(tempUnitGear[g] == '9999') continue
        if (!neededGear[tempUnitGear[g]]) {
          neededGear[tempUnitGear[g]] = {
            id: tempUnitGear[g],
            count: 0
          }
        }
        if (neededGear[tempUnitGear[g]]) ++neededGear[tempUnitGear[g]].count
      }
    }
    if(equipment.length > 0){
      for (let i in equipment) {
        if (neededGear[equipment[i].equipmentId]) --neededGear[equipment[i].equipmentId].count
      }
    }
    let gearParts = await GetGearParts(Object.values(neededGear), inventory)
    if(gearParts?.length > 0) return sorter([{ column: 'count', order: 'descending' }], gearParts)
  }catch(e){
    throw(e);
  }
}
