'use strict'
const numeral = require('numeral')
const mongo = require('mongoclient')
const formatWebUnit = require('src/format/formatWebUnit')
const checkStats = require('./checkStats')
const checkTurnOrder = require('./checkTurnOrder')
const { pct } = require('../enum')
const addRequirement = (obj = {}, type, value)=>{
  if(type && value){
    if(!obj.requirement){
      obj.requirement = type+''+value
    }else{
      obj.requirement += '<br>'+type+''+value
    }
  }
}
module.exports = async(squad = {}, pRoster = [], ignoreStats = false)=>{
  let units = [], info = {unitCount: +(squad.units.length || 0), showStats: false, links: (squad.links || []), note: (squad.note || null)}
  const unitIds = squad.units.map(x=>x.baseId)
  const squadUnits = pRoster.filter(x=> unitIds.includes(x.definitionId.split(':')[0]))
  for(let i in squad.units){
    const uInfo = (await mongo.find('units', {_id: squad.units[i].baseId}, {portrait: 0, thumbnail: 0}))[0]
    const squadUnit = squadUnits.find(x=>x.definitionId.startsWith(squad.units[i].baseId+':'))
    const tempObj = formatWebUnit(squadUnit, uInfo)
    tempObj.notMet = 0
    tempObj.statsNotMet = 0
    if(squad.units[i].rarity) tempObj.reqRarity = +squad.units[i].rarity
    if(squad.units[i].gp) tempObj.reqGP = +squad.units[i].gp
    if(uInfo.combatType == 1 && squad.units[i].gear && squad.units[i].gear.name == 'gear') tempObj.reqGear = +squad.units[i].gear.value
    if(uInfo.combatType == 1 && squad.units[i].gear && squad.units[i].gear.name == 'relic') tempObj.reqRelic = +squad.units[i].gear.value
    if(squadUnit){
      if(tempObj.reqGP && tempObj.reqGP > tempObj.gp) tempObj.notMet++
      if(tempObj.rarity < +tempObj.reqRarity) tempObj.notMet++
      if(tempObj.reqGear && (!tempObj.gear || tempObj.gear < tempObj.reqGear)) tempObj.notMet++
      if(tempObj.reqRelic && (!tempObj.relic || tempObj.relic < tempObj.reqRelic)) tempObj.notMet++
      if(!ignoreStats && squad.units[i].stats && squad.units[i].stats.length > 0){
        info.showStats = true
        const checkStats = checkStats(squad.units[i].stats, squadUnit.stats, squad.units[i].combatType)
        if(checkStats && checkStats.length > 0){
          if(checkStats.filter(x=>x.notMet > 0).length > 0) tempObj.statsNotMet++;
          tempObj.stats = checkStats
        }
      }
    }else{
      tempObj.notMet++
      tempObj.statsNotMet++
      if(!ignoreStats && squad.units[i].stats && squad.units[i].stats.length > 0){
        info.showStats = true
        tempObj.stats = []
        for(let s in squad.units[i].stats){
          const tempObj = squad.units[i].stats[s]
          if(pct[squad.units[i].stats[s].id]) tempObj.pct = true
          if(squad.units[i].stats[s].id == 14 || squad.units[i].stats[s].id == 15) tempObj.pct = true
          tempObj.stat = 0
          if(tempObj.pct) tempObj.stat += '%'
        }
      }
    }
    if(tempObj.reqRarity && tempObj.reqRarity > 1) addRequirement(tempObj, tempObj.reqRarity.toString(), '*')
    if(tempObj.reqRelic){
      addRequirement(tempObj, 'R', (+tempObj.reqRelic - 2).toString())
    }else{
      if(tempObj.reqGear) addRequirement(tempObj, 'G', tempObj.reqGear.toString())
    }
    units.push(tempObj)
  }
  if(squad.units.filter(x=>x.turn).length > 0) checkTurnOrder(units, squadUnits, squad)
  return ({units: units, info: info})
}
