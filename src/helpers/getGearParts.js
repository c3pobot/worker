'use strict'
const { mongo } = require('./mongo')
const GetGearParts = async (gearId, tempGear = {}) => {
  try{
    const returnObj = {}
    let obj = tempGear[gearId]
    if(!obj){
      obj = (await mongo.find('equipmentList', {_id: gearId}))[0]
      if(obj) tempGear[gearId] = obj
    }
    if(!obj) return returnObj
    if (obj?.recipe?.length > 0) {
      let i = obj.recipe.length
      while(i--) {
        if(obj.recipe[i].id === 'GRIND') continue
        let gearParts = await GetGearParts(obj.recipe[i].id, tempGear)
        if(!gearParts) continue;
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
    return returnObj
  }catch(e){
    throw(e)
  }
}
module.exports = GetGearParts
