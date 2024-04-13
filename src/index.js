'use strict'
const log = require('logger')
const SaveSlashCmds = require('./saveSlashCmds')
const { cmdMapReady } = require('./helpers/cmdMap')
const { dataList } = require('.helpers/dataList')
const cmdQue = require('./cmdQue')
let workerType = process.env.WORKER_TYPE || 'swgoh'
const CheckRedis = ()=>{
  let status = redis.status()
  if(status){
    CheckMongo()
    return
  }
  setTimeout(CheckRedis, 5000)
}
const CheckMongo = ()=>{
  let status = mongo.status()
  if(status){
    CheckApi()
    return
  }
  setTimeout(CheckMongo, 5000)
}
const CheckApi = async()=>{
  try{
    let obj = await Client.post('metadata')
    if(obj?.latestGamedataVersion){
      log.info('API is ready...')
      CheckGameData()
      return
    }
    setTimeout(CheckApi, 5000)
  }catch(e){
    log.error(e)
    setTimeout(CheckApi, 5000)
  }
}
const CheckGameData = async()=>{
  try{
    if(dataList?.gameData?.unitData){
      CheckCmdMap()
      return
    }
    setTimeout(CheckGameData, 5000)
  }catch(e){
    log.error(e)
    setTimeout(CheckGameData, 5000)
  }
}
const CheckCmdMap = async()=>{
  try{
    if(process.env.POD_NAME?.toString().endsWith("0")) await saveSlashCmds(baseDir+'/src/cmds', workerType)
    let status = cmdMapReady()
    if(status){
      CmdQue.start()
      return
    }
    setTimeout(CheckCmdMap, 5000)
  }catch(e){
    log.error(e)
    setTimeout(CheckCmdMap, 5000)
  }
}

CheckRedis()
