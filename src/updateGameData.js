'use strict'
const path = require('path')
const apiFetch = require('./helpers/apiFetch')
const log = require('logger')
const swgohClient = require('./swgohClient')
const DATASYNC_URI = process.env.DATASYNC_URI || 'http://data-sync:3000'
let gameVersion
const updateData = async()=>{
  try{
    let obj = await apiFetch(path.join(DATASYNC_URI, 'gameData'))
    if(obj?.version && obj?.data){
      let status = await swgohClient('setGameData', obj.data)
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
    let obj = await apiFetch(path.join(DATASYNC_URI, 'version'))
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
