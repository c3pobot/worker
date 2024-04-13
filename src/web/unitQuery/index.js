'use strict'
const specStats = require("./specStats")
const {reqStats, gearColors, relicStats} = require("./unitInfo")

const GetAbilityDmg = require('./getAbilityDmg')
const GetMods = require('./getMods')
const GetRelicStats = require('./getRelicStats')
const GetUnitStats = require('./getUnitStats')
const GetUnitZetas = require('./getUnitZetas')

module.exports = async(uInfo, uObj)=>{
  try{
    if(uInfo){
      if(!uObj) uObj = {}
      const unit = uInfo.baseId
      uObj.baseId = uInfo.baseId
      const obj = {
        name: uInfo.nameKey,
        level: (uObj.currentLevel || 0),
        rarity: (uObj.currentRarity || 0),
        gp: numeral((uObj.gp || 0)).format('0,0'),
        combatType: uInfo.combatType,
        thumbnailName: uInfo.thumbnailName,
        specStat: {info:[]},
        zeta: []
      }
      if(uObj && uObj.stats){
        obj.unitStats = await GetUnitStats(uObj.stats, uObj.combatType)
        obj.damage = await GetAbilityDmg(uObj, uInfo)
        obj.specStat = await specStats(uObj)
      }else{
        obj.unitStats = {}
        obj.damage = []
      }
      if(uInfo.combatType == 1){
        if(uObj && uObj.stats){
          obj.gear = {
            color: gearColors[uObj.currentTier],
            value: 'G'+uObj.currentTier
          }
          obj.unitMods = await GetMods(uObj.equippedStatMod)
          obj.zeta = await GetUnitZetas(uObj, uInfo)
          if(uObj.relic.currentTier > 2){
            obj.gear.value = 'R'+( (+uObj.relic.currentTier) - 2 )
          }
          obj.addStats = await GetRelicStats(uObj)
        }else{
          obj.gear = {
            color: gearColors[0],
            value: 'G0'
          }
          obj.addStats = []
        }
      }
      return obj
    }else{
      return ({})
    }
  }catch(e){
    console.log(e)
    return ({})
  }
}
