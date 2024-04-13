'use strict'
const numeral = require('numeral')
module.exports = (unit = null, uInfo) => {
  let alignment = unit?.alignment
  if(!alignment) alignment = unitList[unit?.baseId]?.alignment
  if(alignment) alignment = alignment.split('_')[1]
  let obj = {
    alignment: alignment,
    nameKey: uInfo.nameKey || uInfo.name,
    combatType: uInfo.combatType,
    baseId: uInfo.baseId,
    thumbnailName: uInfo.thumbnailName,
    gp: 0,
    formatedGP: 0,
    zeta: 0,
    rarity: 0,
    level: 0,
    relic: 0,
    gear: 0,
    omi: 0,
    ultimate: 0,
    sort: 0
  }
  if(unit){
    obj.gp = +unit?.gp
    obj.sort = unit?.sort || 0
    obj.formatedGP = numeral(unit?.gp).format('0,0')
    obj.rarity = +unit?.currentRarity
    obj.level = +unit?.currentLevel
    if(uInfo.combatType == 1){
      if(unit?.equipment) obj.equipment = unit.equipment
      if(unit?.currentTier) obj.gear = +unit.currentTier
      if(unit?.relic?.currentTier > 2) obj.relic = unit.relic.currentTier
      if(unit?.purchasedAbilityId?.length > 0) obj.ultimate++
      if(uInfo?.skills){
        for(let s in unit.skill){
          if(uInfo.skills[unit.skill[s].id]?.zetaTier && +(unit.skill[s].tier + 2) >= +uInfo.skills[unit.skill[s].id]?.zetaTier ) obj.zeta++
          if(uInfo.skills[unit.skill[s].id]?.omiTier && +(unit.skill[s].tier + 2) >= +uInfo.skills[unit.skill[s].id]?.omiTier ) obj.omi++
        }
      }
    }
  }
  return obj
}
