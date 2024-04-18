const log = require('logger');
const arrayToObject = require('src/helpers/arrayToObject')
const mqtt = require('src/helpers/mqtt');
const mongo = require('mongoclient');
const statCalc = require('statcalc');
let dataList = {
  unitList: {},
  factionList: {},
  gameData: {},
  gameVersion: ''
}
let dataTopic = ''
if(process.env.MQTT_PREFIX) dataTopic += `${process.env.MQTT_PREFIX}/`
dataTopic += 'gameVersions'
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
const update = async()=>{
  try{
    let obj = (await mongo.find('botSettings', {_id: 'gameData'}))[0]
    if(obj?.data && (obj?.version === dataList?.gameVersion || !dataList?.gameVersion)){
      let status = statCalc.setGameData(obj.data)
      if(status) status = await updateUnitsList()
      if(status) status = await updateFactionList()
      if(status){
        dataList.gameVersion = obj.version
        dataList.gameData = obj.data
        log.info(`gameData set to ${dataList?.gameVersion}`)
        return
      }
      setTimeout(update, 5000)
    }
  }catch(e){
    log.error(e)
    setTimeout(update, 5000)
  }
}
mqtt.on('message', (topic, msg)=>{
  if(!msg || topic !== dataTopic) return
  let data = JSON.parse(msg)
  if(!data?.gameVersion) return
  if(dataList.gameVersion !== data.gameVersion) update()
})
const checkMQTTStatus = async()=>{
  try{
    if(mqtt.connected){
      await mqtt.subscribe(dataTopic, { qos: 1, rh: true })
      return
    }
    setTimeout(checkMQTTStatus, 5000)
  }catch(e){
    log.error(e)
    setTimeout(checkMQTTStatus, 5000)
  }
}
checkMQTTStatus()
module.exports = { dataList }
