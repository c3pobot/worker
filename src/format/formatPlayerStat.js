'use strict'
const mongo = require('mongoclient')
const getHigherStat =  require('./getHigherStat')
const getModIndex = require('./getModIndex')
const formatStats = require('./formatStats')
const { dataList } = require('src/helpers/dataList')
module.exports = async(unit = {}, statInfo = {}, sort = mod)=>{
  let obj = {
    sort: 0
  }
  let statId = 0, baseStat = 0, modStat = 0, statName, stats = unit?.stats, nameKey = dataList?.unitList[unit.definitionId?.split(':')[0]]?.name || unit.definitionId?.split(':')[0]
  if(statInfo.statId > 0){
    if(statInfo.statId == 6){
      let uInfo = (await mongo.find('units', {_id: unit.definitionId?.split(':')[0]}, {offenseStatId: 1}))[0]
      if(dataList?.unitList[unit.definitionId?.split(':')[0]]?.offenseStatId === 7){
        statId = 7
        statName = 'S'
      }else{
        statId = 6
        statName = 'P'
      }
    }else{
      statId = statInfo.statId
    }
  }else{
    let higherStat = getHigherStat(stats, statInfo)
    statId = higherStat.id
    statName = higherStat.name
  }

  modStat = (stats.mods[getModIndex(statId)] || 0)
  baseStat = (stats.base[statId] || 0) + (stats.gear[statId] || 0) + (modStat || 0)
  obj.value = formatStats(statId, baseStat, modStat).padStart(statInfo.ln, ' ')+' : '+(statName ? statName+' ' : '')+''+nameKey
  if(sort == 'mod'){
    obj.sort = modStat
  }else{
    obj.sort = baseStat
  }
  return obj
}
