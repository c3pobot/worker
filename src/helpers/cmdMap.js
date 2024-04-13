'use strict'
const log = require('logger')
const mongo = require('mongoclient')
let cmdMap = {}, mongoReady, cmdMapReady, workerType = process.env.WORKER_TYPE || 'swgoh'
dataTopic += 'gameVersions'
const createCmdMap = async()=>{
  try{
    if(!mongoReady) mongoReady = mongo.status()
    if(mongoReady){
      let data = (await mongo.find('slashCmds', {_id: workerType}))[0]
      if(data?.cmdMap){
        cmdMap = data.cmdMap
        cmdMapReady = true
      }
    }
    setTimeout(createCmdMap, 5000)
  }catch(e){
    log.error(e)
    setTimeout(createCmdMap, 5000)
  }
}
createCmdMap()
module.exports.checkCmdMap = (cmd)=>{
  if(cmdMap[cmd]) return true
}
module.exports.cmdMapReady = ()=>{
  return cmdMapReady
}
