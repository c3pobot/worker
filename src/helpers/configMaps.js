'use strict'
const { mongo, mongoStatus } = require('./mongo')
let configMaps = {
  DataCronDefMap: {},
  UnitMap: {},
  UnitArray: [],
  FactionMap: {},
  FactionArray: []
}
const updateMaps = async()=>{
  try{
    let mongoReady = mongoStatus()
    let obj, timeOut = 5000
    if(!mongoReady) timeOut = 5000
    if(mongoReady) obj = await mongo.find('configMaps', {})
    if(obj?.length > 0){
      for(let i in obj){
        if(obj[i]._id === 'dataCronDefMap') configMaps.DataCronDefMap = obj[i].data
        if(obj[i]._id === 'unitMap'){
          configMaps.UnitMap = obj[i].data
          configMaps.UnitArray = Object.values(obj[i].data)
        }
        if(obj[i]._id === 'factionMap'){
          configMaps.FactionMap = obj[i].data
          configMaps.FactionArray = Object.values(obj[i].data)
        }
      }
    }
    setTimeout(updateMaps, timeOut)
  }catch(e){
    console.error(e);
    setTimeout(updateMaps, 5000)
  }
}
updateMaps()
module.exports = {
  configMaps
}
