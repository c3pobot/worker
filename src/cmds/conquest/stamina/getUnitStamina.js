'use strict'
const sorter = require('json-array-sorter')
const { getUnitName } = require('src/helpers')

module.exports = (pObj = {})=>{
  try{
    let res = []
    if(pObj?.conquestStatus?.unitStamina?.length > 0 && pObj?.unit?.length > 0){
      res = pObj.conquestStatus.unitStamina.map(u=>{
        let unit = pObj.unit.find(x=>x.id === u.unitId) || {}
        let baseId = unit.definitionId.split(':')[0]
        return Object.assign({}, {...u,
          nameKey: getUnitName(baseId) || baseId,
          tier: +unit.currentTier,
          rarity: +unit.currentRarity,
          relic: +unit?.relic?.currentTier || 0,
          level: +unit.currentLevel
        })
      })
    }
    if(res?.length > 0) res = sorter([{column: 'nameKey', order: 'ascending'}], res)
    return res
  }catch(e){
    console.error(e)
  }
}
