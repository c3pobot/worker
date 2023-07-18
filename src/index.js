'use strict'
const log = require('logger')
let logLevel = process.env.LOG_LEVEL || log.Level.INFO;
log.setLevel(logLevel);
const SaveCmds = require('./saveCmds')
const UpdateGameData = require('./updateGameData')
const PRIVATE_BOT = +(process.env.PRIVATE_BOT || 0)
const WORKER_NAME = process.env.WORKER_NAME || '0'
const GAME_API_NEEDED = process.env.GAME_API_NEEDED
const { mongoStatus, redisStatus, localQueStatus } = require('helpers')
require('./helpers/botSettings')
require('./helpers/botUpdates')
let swgohClient
if(GAME_API_NEEDED){
  swgohClient = require('./swgohClient')
  require('./helpers/configMaps')
}
const CheckRedis = async()=>{
  try{
    let status = redisStatus()
    if(status){
      CheckMongo()
    }else{
      setTimeout(CheckRedis, 5000)
    }
  }catch(e){
    log.error(e);
    setTimeout(CheckRedis, 5000)
  }
}
const CheckMongo = async()=>{
  try{
    let status = mongoStatus()
    if(status){
      CheckApiReady()
    }else{
      setTimeout(CheckMongo, 5000)
    }
  }catch(e){
    log.error(e);
    setTimeout(CheckMongo, 5000)
  }
}
const CheckApiReady = async()=>{
  try{
    if(GAME_API_NEEDED){
      let status = await swgohClient('getStatus')
      if(status){
        CheckGameData()
      }else{
        setTimeout(CheckApiReady, 5000)
      }
    }else{
      StartServices()
    }
  }catch(e){
    log.error(e)
    setTimeout(CheckApiReady, 5000)
  }
}
const CheckGameData = async()=>{
  try{
    let status = false
    if(GAME_API_NEEDED){
      status = await UpdateGameData()
    }else{
      status = true
    }
    if(status){
      StartServices()
    }else{
      setTimeout(CheckGameData, 5000)
    }
  }catch(e){
    log.error(e);
    setTimeout(CheckApiReady, 5000)
  }
}
const StartServices = async()=>{
  try{
    if(!PRIVATE_BOT && WORKER_NAME?.toString()?.endsWith('0')) await SaveCmds()
    if(WORKER_NAME?.toString()?.endsWith('0')) await require('./checkCmds')
    require('./cmdQue')
  }catch(e){
    log.error(e);
    setTimeout(StartServices, 5000)
  }
}
CheckRedis()
