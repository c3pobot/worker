'use strict'
const mongo = require('mongoclient')
const getGearParts = async (gearId, tempGear = {}) => {
  let returnObj = {}
  let obj = tempGear[gearId]
  if(!obj){
    obj = (await mongo.find('equipment', {_id: gearId}))[0]
    if(obj) tempGear[gearId] = obj
  }
  if (obj) {
    if (obj.recipeId && obj.recipe && obj.recipe.length > 0) {
      for (let i in obj.recipe) {
        if (obj.recipe[i].id != 'GRIND') {
          let gearParts = await getGearParts(obj.recipe[i].id, tempGear)
          if (gearParts) {
            for (let g in gearParts) {
              if (!returnObj[gearParts[g].id]) returnObj[gearParts[g].id] = {
                id: gearParts[g].id,
                count: 0,
                tier: gearParts[g].tier,
                mark: gearParts[g].mark,
                nameKey: gearParts[g].nameKey,
                iconKey: gearParts[g].iconKey
              };
              if (returnObj[gearParts[g].id]) returnObj[gearParts[g].id].count += (+gearParts[g].count * +obj.recipe[i].minQuantity || 0)
            }
          }
        }
      }
    } else {
      if (!returnObj[obj.id]) returnObj[obj.id] = {
        id: obj.id,
        count: 0,
        tier: obj.tier,
        mark: obj.mark,
        nameKey: obj.nameKey,
        iconKey: obj.iconKey
      };
      if (returnObj[obj.id]) {
        returnObj[obj.id].count++
      }
    }
  }
  return returnObj
}
module.exports = getGearParts
