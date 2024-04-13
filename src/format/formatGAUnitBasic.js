'use strict'
const numeral = require('numeral')
const getGAStats = require('./getGAStats')
const getGAZeta = require('./getGAZeta')
module.exports = (meUnit, enUnit, uInfo)=>{
  let tempObj = {
    name: uInfo.nameKey,
    value: '```autohotkey\n'
  }
  if(meUnit || enUnit){
    if (!meUnit) meUnit = {
      gp: 0,
      currentRarity: 0,
      currentTier: 0,
      relic: {
        currentTier: 0
      },
      stats: {}
    };
    if (!enUnit) enUnit = {
      gp: 0,
      currentRarity: 0,
      currentTier: 0,
      relic: {
        currentTier: 0
      },
      stats: {}
    };
    tempObj.value += "GP         :: " +numeral(meUnit.gp).format('0,0').padStart(10, ' ') + " vs " + numeral(enUnit.gp).format('0,0') + "\n"
    tempObj.value += "Rarity     :: " +numeral(meUnit.currentRarity).format("0").padStart(10, ' ') + " vs " + numeral(enUnit.currentRarity).format("0") + "\n";
    if(uInfo.combatType == 1) tempObj.value += "Gear/Relic :: " + (meUnit.currentTier < 13 ? 'G'+meUnit.currentTier : 'R0'+(meUnit.relic.currentTier - 2)).toString().padStart(10, ' ') + " vs " + (enUnit.currentTier < 13 ? 'G'+enUnit.currentTier : 'R0'+(enUnit.relic.currentTier - 2)) + "\n";
    tempObj.value += "Speed      :: " +getGAStats(meUnit.stats, 5).padStart(10, ' ') + " vs " + getGAStats(enUnit.stats, 5) + "\n";
    if(uInfo.combatType == 1 && Object.values(uInfo.skills).find(x=>x.isZeta == true)) tempObj.value += "Zetas      :: " + getGAZeta(meUnit, uInfo).padStart(10, ' ') + " vs " + getGAZeta(enUnit, uInfo) + "\n";
  }else{
    tempObj.value += 'Neither has this unit\n'
  }
  tempObj.value += '```'
  return tempObj
}
