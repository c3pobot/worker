'use strict'
const enum_stars = require('./enumStars')
const fakeMods = require('./fakeMods')
const getUnitStats = require('./getUnitStats')
module.exports = (uInfo = {}, gLevel = 0, rLevel = 0, rarity = 0, calcStats = true)=>{
  if(uInfo?.baseId){
    let useValues = {
      char: {
        rarity: rarity || 1,
        gear: gLevel || 13,
        relic: rLevel || 1,
        equipped: []
      }
    }
    if(uInfo.combatType === 2) useValues = {
      ship: {
        rarity: rarity || 1,
      },
      crew: {
        rarity: rarity || 1,
        gear: gLevel || 13,
        relic: rLevel || 1,
        equipped: [],
        mods: JSON.parse(JSON.stringify(fakeMods))
      }
    }
    let unit = getUnitStats(uInfo.baseId, uInfo.combatType, useValues)
    if(!unit) return
    let tempUnit = {
      skill: [],
      equipment: null,
      equippedStatMod: null,
      purchasedAbilityId: null,
      definitionId: uInfo.baseId + ':'+(enum_stars[rarity] ? enum_stars[rarity]:'SEVEN_STAR'),
      baseId: uInfo.baseId,
      currentRarity: rarity || 1,
      currentLevel: 85,
      currentTier: 1,
      relic: null,
      combatType: uInfo.combatType,
      stats: unit.stats,
      gp: unit.gp,
    }
    for (let i in uInfo.skills) {
      tempUnit.skill.push({
        id: uInfo.skills[i].id,
        tier: (uInfo.skills[i].maxTier - 2)
      })
    }
    if(uInfo.combatType === 1){
      tempUnit.relic = {currentTier: +rLevel}
      tempUnit.currentTier = +gLevel || 13
      tempUnit.equipment = []
      tempUnit.equippedStatMod = []
      tempUnit.purchasedAbilityId = []
      for (let i in uInfo.ultimate) {
        tempUnit.purchasedAbilityId.push(uInfo.ultimate[i].id)
      }
      if(tempUnit.purchasedAbilityId?.length > 0){
        tempUnit.gp += (+tempUnit.purchasedAbilityId.length * 4978) * 1.5
        tempUnit.gp = Math.floor(tempUnit.gp)
      }
      if(!calcStats) tempUnit.equippedStatMod = JSON.parse(JSON.stringify(FakeMods))
    }
    return tempUnit
  }
}
