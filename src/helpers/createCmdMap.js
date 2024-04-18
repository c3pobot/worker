'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const { cmdMap = {} } = require('./cmdMap')
let workerType = process.env.WORKER_TYPE || 'swgoh', cmdMapReady, mongoReady = mongo.status(), notify = true
const create = async()=>{
  try{
    let data, syncTime = 5
    if(!mongoReady) mongoReady = mongo.status()
    if(mongoReady) data = (await mongo.find('slashCmds', { _id: workerType}))[0]
    if(data?.cmdMap){
      for(let i in data.cmdMap){
        if(!cmdMap[i]) cmdMap[i] = require(`src/cmds/${i}`)
      }
      cmdMapReady = true
      if(notify){
        notify = false
        log.info('cmdMap is ready...')
      }
      syncTime = 60
    }
    setTimeout(create, syncTime * 1000)
  }catch(e){
    log.error(`create cmdMap error`)
    log.error(e)
    setTimeout(create, 5000)
  }
}
create()
module.exports = ()=>{
  return cmdMapReady
}
