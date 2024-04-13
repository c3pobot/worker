'use strict'
const numeral = require('numeral')

const getMods = require('./getMods')
const getRelicStats = require('./getRelicStats')
const getUnitSkills = require('./getUnitSkills')
const getUnitStats = require('./getUnitStats')
const specStats = require('./specStats')
const getAblityDmg = require('helpers/getAblityDmg')
module.exports = async(uInfo, unit = {})=>{
  try{
    if(!uInfo) return
    let res = {
      nameKey: uInfo.nameKey,
      baseId: uInfo.baseId,
      level: (unit.currentLevel || 0),
      rarity: (unit.currentRarity || 0),
      gp: numeral((unit.gp || 0)).format('0,0'),
      combatType: uInfo.combatType,
      thumbnailName: uInfo.thumbnailName,
      portrait: uInfo.portrait,
      stats: {},
      damage: [],
      specStat: {info:[]},
      zeta: []
    }
    if(unit?.stats){
      res.stats = await getUnitStats(unit.stats, uInfo.combatType)
      res.damage = await getAblityDmg(unit, uInfo)
      res.specStats = await specStats(unit)
    }
    if(uInfo.combatType == 1){
      if(unit?.stats){
        res.gear = {
          color: HP.enum.gearColors[unit.currentTier],
          value: 'G'+unit.currentTier
        }
        res.unitMods = await getMods(unit.equippedStatMod)
        res.skills = await getUnitSkills(unit, uInfo)
        if(unit.relic.currentTier > 2){
          res.gear.value = 'R'+( (+unit.relic.currentTier) - 2 )
        }
        res.addStats = await getRelicStats(unit)
      }else{
        res.gear = {
          color: HP.enum.gearColors[0],
          value: 'G0'
        }
        res.addStats = []
      }
    }
    return res
  }catch(e){
    throw(e);
  }
}
