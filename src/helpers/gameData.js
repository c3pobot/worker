'use strict'
const log = require('logger');
const mqtt = require('./mqtt');
const mongo = require('mongoclient');
const statCalc = require('statcalc');
let currentGameVersion, dataTopic = ''
if(process.env.MQTT_PREFIX) dataTopic += `${process.env.MQTT_PREFIX}/`
dataTopic += 'gameVersions'
const update = async()=>{
  try{
    let obj = (await mongo.find('botSettings', {_id: 'gameData'}))[0]
    if(obj?.data && (obj?.version === gameVersion || !gameVersion)){
      let status = statCalc.setGameData(obj.data)
      if(status){
        currentGameVersion = obj.version
        gameVersion = obj.version;
        gameData = obj.data
        HP.UpdateUnitsList()
        log.info(`gameData set to ${currentGameVersion}`)
        return true
      }
    }
  }catch(e){
    log.error(e)
    setTimeout(update, 5000)
  }
}
const processMQTTMsg = async(msg)=>{
  try{
    let data = JSON.parse(msg)
    if(!data?.gameVersion) return
    if(gameVersion !== data.gameVersion){
      await updateAutoObj()
      await updateNameKeys()
      gameVersion = data.gameVersion
      log.info(`Updated autoComplete data to version ${gameVersion}...`)
    }
  }catch(e){
    log.error(e)
  }
}
mqtt.on('message', (topic, msg)=>{
  if(!msg || topic !== dataTopic) return
  processMQTTMsg(msg)
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
update()
checkMQTTStatus()
