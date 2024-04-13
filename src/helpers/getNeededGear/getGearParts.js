'use strict'
const getGearParts = require('../getGearParts')
module.exports = async(unequippedGear = [])=>{
  let tempGear = {}, gearObj = {}
  for (let i in unequippedGear) {
    if (unequippedGear[i].count > 0) {
      if (unequippedGear[i].id != '9999') {
        let gearParts = await getGearParts(unequippedGear[i].id, tempGear)
        if (gearParts) {
          for (let a in gearParts) {
            if (!gearObj[gearParts[a].id]) gearObj[gearParts[a].id] = {
              id: gearParts[a].id,
              count: 0,
              tier: gearParts[a].tier,
              mark: gearParts[a].mark,
              nameKey: gearParts[a].nameKey,
              iconKey: gearParts[a].iconKey
            };
            if (gearObj[gearParts[a].id]) gearObj[gearParts[a].id].count += (+gearParts[a].count * +unequippedGear[i].count || 1)
          }
        }
      }
    }
  }
  return Object.values(gearObj)
}
