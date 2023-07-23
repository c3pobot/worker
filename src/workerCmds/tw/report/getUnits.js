'use strict'
const { log, DeepCopy } = require('helpers')
const { configMaps } = require('helpers/configMaps')
const checkMembers = (uInfo = {}, member = [], res = {})=>{
  try{
    let i = member.length
    while(i--){
      let unit = member[i].roster[uInfo.baseId]
      if(!unit) continue;
      ++res.count
      if(!res.rarityCount[unit.rarity]) res.rarityCount[unit.rarity] = 0
      ++res.rarityCount[unit.rarity]
      if(uInfo.combatType === 2) continue;
      if(unit.relicTier > 0) {
        if(!res.relicCount[unit.relicTier]) res.relicCount[unit.relicTier] = 0
        ++res.relicCount[unit.relicTier]
        ++res.relicCount.total
      }
      if(unit.zetaCount > 0){
        if(unit.zetaCount === uInfo.zeta){
          ++res.zetaCount.all
        }else{
          ++res.zetaCount.some
        }
      }
      if(uInfo.omiType === 8 && unit.omiCount > 0){
        if(unit.omiCount >= uInfo.omi){
          ++res.omiCount.all
        }else{
          ++res.omiCount.some
        }
      }
      if(uInfo.isGl && unit.ultimate && Object.values(unit.ultimate)?.length > 0) ++res.ultimateCount
    }
  }catch(e){
    throw(e)
  }
}
module.exports = (guild = {}, units = [])=>{
  try{
    if(units.length === 0 || !configMaps?.UnitMap) return
    let i = units.length, res = {}
    while(i--){
      let member = guild.member.filter(x=>x.roster && x.roster[units[i]])
      if(!member || member.length === 0) continue
      let unit = configMaps.UnitMap[units[i]]
      if(!unit) continue;
      if(!res[unit.baseId]){
        res[unit.baseId] = DeepCopy(unit)
        res[unit.baseId].count = 0
        res[unit.baseId].relicCount = {total: 0}
        res[unit.baseId].rarityCount = {}
        res[unit.baseId].ultimateCount = 0
        res[unit.baseId].zetaCount = { all: 0, some: 0 }
        res[unit.baseId].omiCount = { all: 0, some: 0 }
      }
      checkMembers(unit, member, res[unit.baseId])
    }
    return res
  }catch(e){
    throw(e)
  }
}
