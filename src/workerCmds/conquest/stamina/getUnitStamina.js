'use strict'
const { configMaps } = require('helpers/configMaps')
const sorter = require('json-array-sorter')
const MapUnit = (u, unit)=>{
  let tempObj = Object.assign({}, u)
  tempObj.nameKey = configMaps?.UnitMap[unit.definitionId.split(':')[0]]?.nameKey
  tempObj.tier = +unit.currentTier
  tempObj.rarity = +unit.currentRarity
  tempObj.relic = +(unit.relic.currentTier || 0)
  tempObj.level = +unit.currentLevel
  return tempObj
}

module.exports = (pObj = {})=>{
  try{
    let res = []
    if(pObj?.conquestStatus?.unitStamina?.length > 0 && pObj?.unit?.length > 0) res = pObj.conquestStatus.unitStamina.map(u=> MapUnit(u, pObj.unit.find(x=>x.id === u.unitId)))
    if(res?.length > 0) res = sorter([{column: 'nameKey', order: 'ascending'}], res)
    return res
  }catch(e){
    throw(e)
  }
}
