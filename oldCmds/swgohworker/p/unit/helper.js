'use strict'
const UnitQuery = require('src/web/unitQuery')
const Cmds = {}
const enum_stars = {
  1: 'ONE_STAR',
  2: 'TWO_STAR',
  3: 'THREE_STAR',
  4: 'FOUR_STAR',
  5: 'FIVE_STAR',
  6: 'SIX_STAR',
  7: 'SEVEN_STAR'
}
Cmds.GetUnitObj = async(uInfo, roster = [], gLevel = null, rLevel = null, rarity = null)=>{
  try{
    let unitArray = [], unit
    const tempUnit = roster.find(x=>x.definitionId.startsWith(uInfo.baseId + ':'))
    if(tempUnit){
      unit = JSON.parse(JSON.stringify(tempUnit))
      if(gLevel || rLevel || rarity){
        delete unit.stats
        delete unit.gp
        unitArray.push(unit)
        if(uInfo.combatType == 2 && uInfo.crew && uInfo.crew.length > 0){
          for(let i in uInfo.crew){
            const tempCrew = roster.find(x=>x.definitionId.startsWith(uInfo.crew[i]+':'))
            if(tempCrew) unitArray.push(JSON.parse(JSON.stringify(tempCrew)))
          }
        }
        if(unitArray.length > 0){
          for(let i in unitArray){
            unitArray[i].currentLevel = 85
            if(rarity){
              unitArray[i].currentRarity = rarity
              unitArray[i].definitionId = unitArray[i].definitionId.split(':')[0] + ':'+(enum_stars[rarity] ? enum_stars[rarity]:'SEVEN_STAR')
            }
            if(unitArray[i].relic && (gLevel || rLevel)){
              unitArray[i].equipment = []
              if(gLevel){
                unitArray[i].currentTier = gLevel
                unitArray[i].relic.currentTier = (gLevel == 13 ? 1:0)
              }
              if(rLevel) unitArray[i].relic.currentTier = rLevel
            }
          }
          if(unitArray.length > 0) unitArray = await Client.stats(unitArray)
          if(unitArray.length > 0) unit = unitArray.find(x=>x.definitionId.startsWith(uInfo.baseId + ':'))
        }
      }
      return unit
    }
  }catch(e){
    console.error()
  }
}
module.exports = Cmds
