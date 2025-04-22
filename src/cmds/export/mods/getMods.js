'use strict'
const { getUnitName } = require('src/helpers')

const getStat = ( stat = {} )=>{
  if(!stat?.unitStatId) return
  return { unitStatId: stat.unitStatId, statValueDecimal: stat.statValueDecimal, unscaledDecimalValue: stat.unscaledDecimalValue }
}
const formatMod = (mod = {})=>{
  let res = { definitionId: mod.definitionId, level: mod.level, tier: mod.tier, locked: mod.locked, primaryStat: { stat: getStat(mod.primaryStat?.stat) }, secondaryStat: [] }
  for(let i in mod.secondaryStat){
    res.secondaryStat.push({ stat: getStat(mod.secondaryStat[i]?.stat) })
  }
  return res
}
const getUnitMods = (unit = {}, res = [])=>{
  for(let i in unit.equippedStatMod){
    let tempMod = formatMod(unit.equippedStatMod[i])
    tempMod.baseId = unit.baseId || 'NONE'
    tempMod.unit = getUnitName(unit.baseId)
    res.push(tempMod)
  }
}
module.exports.equipped = ( units = [])=>{
  let res = []
  for(let i in units) getUnitMods(units[i], res)
  return res
}
module.exports.unequipped = ( mods = [])=>{
  let res = []
  for(let i in mods){
    let tempMod = formatMod(mods[i])
    tempMod.baseId = 'NONE'
    tempMod.unit = 'none'
    res.push(tempMod)
  }
  return res
}
