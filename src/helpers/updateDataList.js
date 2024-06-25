'use strict'
const log = require('logger');
const mongo = require('mongoclient')
const arrayToObject = require('src/helpers/arrayToObject')
const statCalc = require('statcalc');
const swgohGGApi = require('./swgohGGApi')

const { dataList } = require('./dataList')
const updateUnitsList = async()=>{
  let units = (await mongo.find('autoComplete', {_id: 'unit'}, {data: {value: 0}}))[0]
  if(units?.data?.length > 0){
    let tempUnits = arrayToObject(units.data, 'baseId')
    if(Object.values(tempUnits)?.length > 0){
      dataList.unitList = tempUnits
      return true
    }
  }
}
const updateFactionList = async()=>{
  let factions = (await mongo.find('autoComplete', {_id: 'faction'}))[0]
  if(factions?.data?.length > 0){
    let tempFaction = arrayToObject(factions.data, 'value')
    if(Object.values(tempFaction)?.length > 0){
      dataList.factionList = tempFaction
      return true
    }
  }
}
const updateSwgohGG = async()=>{
  let units = await swgohGGApi('units')
  units = units?.data
  if(!units || units?.length === 0) return
  for(let i in units){
    if(!units[i]?.base_id || !units[i]?.url) continue
    dataList.swgohgg[units[i].base_id] = { baseId: units[i].base_id, url: `https:${units[i].url}` }
  }
  return true
}
const update = async()=>{
  let obj = (await mongo.find('botSettings', {_id: 'gameData'}))[0]
  if(!obj?.data || !obj?.version) return
  let status = statCalc.setGameData(obj.data)
  if(status) status = await updateUnitsList()
  if(status) status = await updateFactionList()
  if(status) status = await updateSwgohGG()
  if(!status) return
  dataList.gameVersion = obj.version
  dataList.gameData = obj.data
  log.info(`gameData set to ${dataList?.gameVersion}`)
  return true
}
const start = async()=>{
  try{
    let status = mongo.status()
    if(status) status = await update()
    if(status) return
    setTimeout(start, 5000)
  }catch(e){
    log.error(e)
    setTimeout(start, 5000)
  }
}
start()
module.exports = start
