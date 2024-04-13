'use strict'
const getUnit = require('../getUnit')
const formatWebUnitStats = require('src/format/formatWebUnitStats')
module.exports = async(squadUnits = [], pUnits = [])=>{
  let units = []
  for(let i in squadUnits){
    const uInfo = await getUnit(squadUnits[i].baseId, true, false)
    if(uInfo){
      const unit = formatWebUnitStats(pUnits.find(x=>x.definitionId.startsWith(squadUnits[i].baseId+':')), uInfo)
      if(unit) units.push(unit)
    }
  }
  return units
}
