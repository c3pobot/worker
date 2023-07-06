'use strict'
const BotSocket = require('./helpers/botSocket')
const swgohClient = require('./swgohClient')
const DATASYNC_POD_NAME = process.env.DATASYNC_POD_NAME || 'datasync'
let gameVersion
const updateData = async()=>{
  try{
    let obj = await BotSocket.call('getGameData', {podName: DATASYNC_POD_NAME})
    if(obj?.version && obj?.data){
      let status = await swgohClient('setGameData', obj.data)
      if(status){
        console.log('gameData set to version '+obj.version)
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
    let obj = await BotSocket.call('getVersion', {podName: DATASYNC_POD_NAME})
    if(obj?.version && obj.version !== gameVersion) await updateData()
    if(!gameVersion){
      setTimeout(SyncData, 5000)
    }else{
      setTimeout(SyncData, 5 * 60 * 1000)
    }
  }catch(e){
    console.error(e);
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
