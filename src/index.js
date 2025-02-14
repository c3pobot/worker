'use strict'
const log = require('logger')
const mongo = require('mongoclient')

const minio = require('./minio')
const rabbitmq = require('./rabbitmq')
const cmdQue = require('./cmdQue')
const swgohClient = require('./swgohClient')
const saveSlashCmds = require('./saveSlashCmds')
const updateDataList = require('./helpers/updateDataList')
const checkCmds = require('./checkCmds')
const createCmdMap = require('./helpers/createCmdMap')

const { dataList } = require('./helpers/dataList')

let workerType = process.env.WORKER_TYPE || 'swgoh'

const CheckMongo = ()=>{
  log.info(`start up mongo check...`)
  if(mongo.status()){
    CheckRabbitMQ()
    return
  }
  setTimeout(CheckMongo, 5000)
}
const CheckRabbitMQ = ()=>{
  try{
    if(!rabbitmq?.status) log.debug(`rabbitmq is not ready...`)
    if(rabbitmq?.status){
      log.debug(`rabbitmq is ready...`)
      CheckMinio()
      return
    }
    setTimeout(CheckRabbitMQ, 5000)
  }catch(e){
    log.error(e)
    setTimeout(CheckRabbitMQ, 5000)
  }
}
const CheckMinio = ()=>{
  try{
    log.info(`start up minio check...`)
    if(minio.status()){
      CheckApi()
      return
    }
    setTimeout(CheckMinio, 5000)
  }catch(e){
    log.error(e)
    setTimeout(CheckMinio, 5000)
  }
}
const CheckApi = async()=>{
  try{
    log.info(`start up api check...`)
    let obj = await swgohClient.post('metadata')
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
    log.info(`start up gameData check...`)
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
    log.info(`start up cmdMap check...`)
    saveSlashCmds(baseDir+'/src/cmds', workerType)
    await checkCmds()
    let status = await createCmdMap()
    if(status){
      cmdQue.start()
      require('./exchange')
      return
    }
    setTimeout(CheckCmdMap, 5000)
  }catch(e){
    log.error(e)
    setTimeout(CheckCmdMap, 5000)
  }
}

setTimeout(CheckMongo, 5000)
