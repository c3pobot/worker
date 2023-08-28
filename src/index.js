'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const redis = require('redisclient')

const SaveCmds = require('./saveCmds')
const CmdQue = require('./cmdQue')
const PRIVATE_BOT = +(process.env.PRIVATE_BOT || false)
const WORKER_NAME = process.env.POD_NAME || 'worker-0'
const GAME_API_NEEDED = process.env.GAME_API_NEEDED
let logLevel = process.env.LOG_LEVEL || log.Level.INFO;
log.setLevel(logLevel);


require('./helpers/botSettings')
require('./helpers/botUpdates')
let swgohClient, updateGameData
if(GAME_API_NEEDED){
  swgohClient = require('./swgohClient')
  updateGameData = require('./updateGameData')
  require('./helpers/configMaps')
}
const CheckRedis = async()=>{
  try{
    let status = redis.status()
    if(status){
      CheckMongo()
      return
    }
    setTimeout(CheckRedis, 5000)
  }catch(e){
    log.error(e);
    setTimeout(CheckRedis, 5000)
  }
}
const CheckMongo = async()=>{
  try{
    let status = mongo.status()
    if(status){
      if(GAME_API_NEEDED){
        CheckApiReady()
        return
      }else{
        StartServices()
        return
      }
    }
    setTimeout(CheckMongo, 5000)
  }catch(e){
    log.error(e);
    setTimeout(CheckMongo, 5000)
  }
}
const CheckApiReady = async()=>{
  try{
    let status = await swgohClient('getStatus')
    if(status){
      CheckGameData()
      return
    }
    setTimeout(CheckApiReady, 5000)
  }catch(e){
    log.error(e)
    setTimeout(CheckApiReady, 5000)
  }
}
const CheckGameData = async()=>{
  try{
    let status = await updateGameData()
    if(status){
      StartServices()
      return
    }
    setTimeout(CheckGameData, 5000)
  }catch(e){
    log.error(e);
    setTimeout(CheckGameData, 5000)
  }
}
const StartServices = async()=>{
  try{
    if(!PRIVATE_BOT && WORKER_NAME?.toString()?.endsWith('0')) await SaveCmds()
    if(WORKER_NAME?.toString()?.endsWith('0')) await require('./checkCmds')
    CmdQue.start()
  }catch(e){
    log.error(e);
    setTimeout(StartServices, 5000)
  }
}
CheckRedis()
