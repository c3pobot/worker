'use strict'
const mongo = require('mongoclient')
const enum_stars = require('./enumStars')
const { calcRosterStats } = require('statcalc')

const modifyUnit = async(uInfo = {}, roster = [], gLevel = null, rLevel = null, rarity = null, calcStats = true)=>{
  if(!uInfo.baseId || !roster || roster?.length === 0) return
  let units = []

  let tempUnit = roster.find(x=>x.definitionId.startsWith(uInfo.baseId + ':'))
  if(!tempUnit) return
  let unit = JSON.parse(JSON.stringify(tempUnit))

  if(gLevel || rLevel || rarity){
    delete unit.stats
    delete unit.gp
    unit.currentLevel = 85
    if(rarity){
      unit.currentRarity = rarity
      unit.definitionId = unit.definitionId.split(':')[0] + ':'+(enum_stars[rarity] ? enum_stars[rarity]:'SEVEN_STAR')
    }
    if(uInfo.combatType === 1 && (gLevel || rLevel)){
      unit.equipment = []
      if(gLevel){
        unit.currentTier = gLevel
        unit.relic = {currentTier: (gLevel == 13 ? 1:0)}
      }
      if(rLevel){
        unit.currentTier = 13
        unit.relic = {currentTier: rLevel}
        unit.rarity = 7
      }
    }
  }
  units.push(unit)
  if(calcStats && uInfo.combatType === 2 && uInfo.crew?.length > 0){
    let crewInfos = await mongo.find('units', {_id: {$in: uInfo.crew}})
    for(let i in uInfo.crew){
      let tempCrew = await modifyUnit(crewInfos.find(x=>x._id === uInfo.crew[i]), roster, gLevel, rLevel, rarity, false)
      if(tempCrew) units.push(tempCrew)
    }
  }

  if(units.length > 0 && calcStats) calcRosterStats(units)
  if(units.length > 0) unit = units.find(x=>x.definitionId.startsWith(uInfo.baseId + ':'))
  return unit
}
module.exports = modifyUnit
