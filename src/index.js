'use strict'
const SaveCmds = require('./saveCmds')
const UpdateGameData = require('./updateGameData')
const PRIVATE_BOT = +(process.env.PRIVATE_BOT || 0)
const WORKER_NAME = process.env.WORKER_NAME || '0'
const GAME_API_NEEDED = process.env.GAME_API_NEEDED
const { mongoStatus, redisStatus, localQueStatus } = require('helpers')
let swgohClient
if(GAME_API_NEEDED){
  swgohClient = require('./swgohClient')
  require('./helpers/configMaps')
}
const CheckRedis = async()=>{
  try{
    let status = redisStatus()
    if(status){
      CheckLocalQue()
    }else{
      setTimeout(CheckRedis, 5000)
    }
  }catch(e){
    console.error(e);
    setTimeout(CheckRedis, 5000)
  }
}
const CheckLocalQue = async()=>{
  try{
    let status = localQueStatus()
    if(status){
      CheckMongo()
    }else{
      setTimeout(CheckLocalQue, 5000)
    }
  }catch(e){
    console.error(e);
    setTimeout(CheckLocalQue, 5000)
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
    console.error(e);
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
    console.error(e)
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
    console.error(e);
    setTimeout(CheckApiReady, 5000)
  }
}
const StartServices = async()=>{
  try{
    if(!PRIVATE_BOT && WORKER_NAME?.toString()?.endsWith('0')) await SaveCmds()
    require('./cmdQue')
  }catch(e){
    console.error(e);
    setTimeout(StartServices, 5000)
  }
}
CheckRedis()
