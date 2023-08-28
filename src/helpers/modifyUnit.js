'use strict'
const statCalc = require('statcalc')
const { configMaps } = require('./configMaps')
const deepCopy = require('./deepCopy')
const enum_stars = {
  1: 'ONE_STAR',
  2: 'TWO_STAR',
  3: 'THREE_STAR',
  4: 'FOUR_STAR',
  5: 'FIVE_STAR',
  6: 'SIX_STAR',
  7: 'SEVEN_STAR'
}
const modifyUnit = async(baseId, roster = [], gLevel, rLevel, rarity, calcStats = true)=>{
  try{
    let units = [], uInfo = configMaps.UnitMap[baseId]
    let tempUnit = roster.find(x=>x.definitionId.startsWith(baseId+':'))
    if(!tempUnit) return
    if(gLevel || rLevel || rarity){
      delete tempUnit.stats
      delete tempUnit.gp
      tempUnit.currentLevel = 85
      if(rarity){
        tempUnit.currentRarity = rarity
        tempUnit.definitionId = tempUnit.definitionId.split(':')[0] + ':'+(enum_stars[rarity] ? enum_stars[rarity]:'SEVEN_STAR')
      }
      if(uInfo.combatType === 1 && (gLevel || rLevel)){
        tempUnit.equipment = []
        if(gLevel){
          tempUnit.currentTier = gLevel
          tempUnit.relic = {currentTier: (gLevel == 13 ? 1:0)}
        }
        if(rLevel){
          tempUnit.currentTier = 13
          tempUnit.relic = {currentTier: rLevel}
          tempUnit.rarity = 7
        }
      }
    }
    if(!calcStats) return tempUnit
    units.push(tempUnit)
    if(uInfo.combatType ===2 && uInfo.crew){
      for(let i in uInfo.crew){
        let tempCrew = await modifyUnit(uInfo.crew[i], roster, gLevel, rLevel, rarity, false)
        if(tempCrew) units.push(tempCrew)
      }
    }
    if(units.length > 0){

      let res = await statCalc.calcRosterStats(units)
      if(res?.roster[baseId]) return res?.roster[baseId]

    }
  }catch(e){
    throw(e)
  }
}
module.exports = modifyUnit
