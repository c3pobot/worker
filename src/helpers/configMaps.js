'use strict'
const log = require('logger')
const { mongo, mongoStatus } = require('./mongo')
let configMaps = {
  DataCronDefMap: {},
  UnitMap: {},
  UnitArray: [],
  FactionMap: {},
  StatsMap: {},
  FactionArray: []
}
const updateMaps = async(notify = false)=>{
  try{
    let checkTime = 60, notifyUpdate = false
    let obj = await mongo.find('configMaps', {})
    if(obj?.length > 0){
      for(let i in obj){
        if(obj[i]._id === 'dataCronDefMap') configMaps.DataCronDefMap = obj[i].data
        if(obj[i]._id === 'statDefMap') configMaps.StatsMap = obj[i].data
        if(obj[i]._id === 'unitMap'){
          configMaps.UnitMap = obj[i].data
          configMaps.UnitArray = Object.values(obj[i].data)
        }
        if(obj[i]._id === 'factionMap'){
          configMaps.FactionMap = obj[i].data
          configMaps.FactionArray = Object.values(obj[i].data)
        }
      }
      if(notify) log.debug('configMaps updated...')
    }else{
      if(notify) notifyUpdate = true
      checkTime = 5
    }
    setTimeout(()=>updateMaps(notifyUpdate), checkTime * 1000)
  }catch(e){
    log.error(e);
    setTimeout(()=>updateMaps(notify), 5000)
  }
}
const checkMongo = ()=>{
  try{
    let status = mongoStatus()
    if(status){
      updateMaps(true)
    }else{
      setTimeout(checkMongo, 5000)
    }
  }catch(e){
    log.error(e)
    setTimeout(checkMongo, 5000)
  }
}
checkMongo()
module.exports = {
  configMaps
}
