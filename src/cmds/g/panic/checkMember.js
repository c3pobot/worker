'use strict'
const mongo = require('mongoclient')
const { dataList } = require('src/helpers/dataList')
const getUnits = (units = [], roster = {}, unitList = {}, requiredUnits = false)=>{
  let res = []
  for(let i in units){
    let unit = roster[units[i].baseId] || {}, uInfo = dataList?.unitList[units[i].baseId], unitListUpdate = false
    if(!uInfo?.baseId) continue
    if(!unitList[uInfo.baseId]){
      unitList[uInfo.baseId] = { level: 85, baseId: uInfo.baseId, nameKey: uInfo.name, thumbnailName: uInfo.thumbnailName, combatType: uInfo.combatType, optional: true, relic: 0, gear: 1, alignment: uInfo.alignment?.split('_')[1] || 'neutral', rarity: units[i].rarity || 1, gp: units[i].gp || 0 }
      if(requiredUnits) unitList[uInfo.baseId].optional = false
      unitList.count++
      unitListUpdate = true
    }
    let tempUnit = { notMet: 0, rarityNotMet: false, gearNotMet: false, gpNotMet: false, combatType: uInfo.combatType, baseId: uInfo.baseId, gp: unit.gp || 0, rarity: unit.rarity || 0, relicTier: unit.relicTier || 0, gear: unit.gearTier || 0 }
    if(units[i].gp > 0 && units[i].gp > tempUnit.gp){
      tempUnit.notMet++
      tempUnit.gpNotMet = true
    }
    if(units[i].rarity > 1 && tempUnit.rarity < units[i].rarity){
      tempUnit.notMet++
      tempUnit.rarityNotMet = true
    }
    if(uInfo.combatType === 1 && units[i]?.gear?.value > 1){
      if(unitListUpdate && units[i].gear.name == 'gear'){
        unitList[uInfo.baseId].relic = 0
        unitList[uInfo.baseId].gear = units[i].gear.value
      }
      if(unitListUpdate && units[i].gear.name == 'relic'){
        unitList[uInfo.baseId].relic = units[i].gear.value
        unitList[uInfo.baseId].gear = 13
      }
      if(units[i].gear.name == 'gear' && units[i].gear.value > (tempUnit.gearTier || 0)){
        if(units[i].gear.value > 11 && tempUnit.rarity < 7){
          if(units[i].rarity < 2 || !units[i].rarity){
            tempUnit.notMet++
            tempUnit.rarityNotMet = true
          }
        }
        tempUnit.notMet++
        tempUnit.gearNotMet = true
      }
      if(units[i].gear.name == 'relic' && units[i].gear.value > (tempUnit.relicTier || 0) + 2){
        if(tempUnit.rarity < 7){
          if(units[i].rarity < 2 || !units[i].rarity){
            tempUnit.notMet++
            tempUnit.rarityNotMet = true
          }
        }
        tempUnit.notMet++
        tempUnit.gearNotMet = true
      }
    }
    res.push(tempUnit)
  }
  return res
}
const getFactionUnits = (units = [], req = {})=>{
  let res = []
  for(let i in units){
    let uInfo = dataList?.unitList[units[i]]
    if(!uInfo.baseId) continue
    if(req.combatType !== uInfo.combatType) continue
    res.push({...{ baseId: uInfo.baseId },...req})
  }
  return res
}
module.exports = async(roster = {}, guideTemplate = {}, factionList = {}, unitList = {})=>{
  let requiredUnits = [], groups = {}, factions = {}, notMet = 0
  if(guideTemplate.units?.length > 0){
    let tempUnits = getUnits(guideTemplate.units, roster, unitList, true)
    if(tempUnits?.length > 0) requiredUnits = requiredUnits.concat(tempUnits)
    let metUnits = tempUnits?.filter(x=>x.notMet === 0).length || 0
    if(guideTemplate.units?.length > metUnits){
      notMet += guideTemplate.units?.length - metUnits
    }
  }
  if(guideTemplate.groups?.length > 0){
    for(let i in guideTemplate.groups){
      let tempUnits = getUnits(guideTemplate.groups[i].units, roster, unitList)
      if(tempUnits?.length > 0) groups[guideTemplate.groups[i].id] = tempUnits
      let metUnits = tempUnits?.filter(x=>x.notMet === 0).length || 0
      if(guideTemplate.groups[i].numUnits && guideTemplate.groups[i].numUnits > metUnits){
        notMet += guideTemplate.groups[i].numUnits - metUnits
      }
    }
  }
  if(guideTemplate.factions?.length > 0){
    for(let i in guideTemplate.factions){
      if(!guideTemplate.factions[i]?.units || guideTemplate.factions[i].units?.length === 0) continue
      let tempUnits = getUnits(guideTemplate.factions[i].units, roster, unitList)
      if(tempUnits?.length > 0) factions[guideTemplate.factions[i].baseId] = tempUnits
      let metUnits = tempUnits?.filter(x=>x.notMet === 0).length || 0
      if(guideTemplate.factions[i].numUnits && guideTemplate.factions[i].numUnits > metUnits){
        notMet += guideTemplate.factions[i].numUnits - metUnits
      }
    }
  }
  return { requiredUnits: requiredUnits, groups: groups, factions: factions, notMet: notMet }
}
