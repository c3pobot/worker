'use strict'
const getGearParts = require('./getGearParts')
const getMissingGear = require('./getMissingGear')
module.exports = async(inventory = [], equipment = [], unitGear = {}, currentTier = 1, gearLevel = 13)=>{
  let neededGear = {}
  for(let i = +currentTier; i < gearLevel; i++){
    const tempUnitGear = unitGear[i]?.gear
    for (let g in tempUnitGear) {
      if (tempUnitGear[g] != '9999') {
        if (!neededGear[tempUnitGear[g]]) {
          neededGear[tempUnitGear[g]] = {
            id: tempUnitGear[g],
            count: 0
          }
        }
        if (neededGear[tempUnitGear[g]]) neededGear[tempUnitGear[g]].count++
      }
    }
  }
  if(equipment.length > 0){
    for (let i in equipment) {
      if (neededGear[equipment[i].equipmentId]) neededGear[equipment[i].equipmentId].count--
    }
  }
  let gearParts = await getGearParts(Object.values(neededGear))
  if(gearParts?.length > 0) return getMissingGear(inventory, gearParts)
}
