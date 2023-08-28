'use strict'
const log = require('logger')
const path = require('path')
const statCalc = require('statcalc')
const mongo = require('mongoclient')

const apiFetch = require('./helpers/apiFetch')

const swgohClient = require('./swgohClient')
let gameVersion

const updateData = async()=>{
  try{
    let obj = (await mongo.find('botSettings', { _id: 'gameData' }))[0]
    if(obj?.version && obj?.data){
      let status = await statCalc.setGameData(obj.data)
      if(status){
        log.info('gameData set to version '+obj.version)
        gameVersion = obj.version
        return true
      }
    }
  }catch(e){
    throw(e);
  }
}
const SyncData = async()=>{
  try{
    let obj = (await mongo.find('botSettings', { _id: 'gameData' }, { version: 1}))
    if(obj?.version && obj.version !== gameVersion) await updateData()
    if(!gameVersion){
      setTimeout(SyncData, 5000)
    }else{
      setTimeout(SyncData, 5 * 60 * 1000)
    }
  }catch(e){
    log.error(e);
    setTimeout(SyncData, 5000)
  }
}
module.exports = async()=>{
  try{
    let status = await updateData()
    if(status){
      SyncData()
      return true
    }
  }catch(e){
    throw(e);
  }
}
