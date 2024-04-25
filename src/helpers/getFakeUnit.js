'use strict'
const mongo = require('mongoclient')
const enum_stars = require('./enumStars')
const fakeMods = require('./fakeMods')
const { calcRosterStats } = require('statcalc')
const getFakeUnit = async(uInfo = {}, gLevel = 0, rLevel = 0, rarity = 0, calcStats = true)=>{
  if(!uInfo?.baseId) return
  let unit = {
    definitionId: `${uInfo.baseId}:${enum_stars[rarity] || 'SEVEN_STAR'}`,
    baseId: uInfo.baseId,
    equippedStatMod: [],
    purchasedAbilityId: Object.values(uInfo.ultimate)?.map(x=>x.id) || [],
    equipment: [],
    currentLevel: 85,
    currentRarity: rarity || 1,
    currentTier: 1,
    skill: Object.values(uInfo.skills)?.map(x=>{ return { id: x.id, tier: x.maxTier - 2 }; })
  }
  if(uInfo.combatType === 1){
    //add 6 pip mods for crew members
    if(!calcStats) unit.equippedStatMod = JSON.parse(JSON.stringify(fakeMods))
    unit.currentTier = gLevel || 13
    unit.relic = { currentTier: rLevel || 1 }
  }

  if(!calcStats) return unit
  let units = [unit]
  if(uInfo.combatType === 2 && uInfo.crew?.length > 0){
    let crewInfos = await mongo.find('units', {_id: {$in: uInfo.crew}})
    for(let i in crewInfos){
      let tempCrew = await getFakeUnit(crewInfos[i], gLevel, rLevel, rarity, false)
      if(tempCrew) units.push(tempCrew)
    }
  }
  calcRosterStats(units)
  if(!units || units?.length == 0) return
  let tempUnit = units.find(x=>x.baseId === uInfo.baseId)
  if(!tempUnit) return
  //add gp for max mods to char units.
  if(uInfo.combatType === 1) tempUnit.gp += 2295
  return tempUnit
}
module.exports = getFakeUnit
