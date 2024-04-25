'use strict'
const log = require('logger')
const fs = require('fs')
const mongo = require('mongoclient')
const { cmdMap = {} } = require('./cmdMap')
let workerType = process.env.WORKER_TYPE || 'swgoh', cmdMapReady, mongoReady = mongo.status(), notify = true, started
const readFiles = ()=>{
  return new Promise((resolve)=>{
    fs.readdir(`/app/src/cmds`, (err, files)=>{
      if(err) log.error(e)

      resolve(new Set(files))
    })
  })
}
const create = async()=>{
  try{
    let data, syncTime = 5
    let files = await readFiles()
    if(!mongoReady) mongoReady = mongo.status()
    if(mongoReady) data = (await mongo.find('slashCmds', { _id: workerType}))[0]
    if(data?.cmdMap && files){
      for(let i in data.cmdMap){
        if(!files?.has(i)){
          log.info(`files for cmd ${i} do not exist...`)
          continue
        }
        if(!cmdMap[i]) cmdMap[i] = require(`src/cmds/${i}`)
        //if(!cmdMap[i]) cmdMap[i] = data.cmdMap[i]
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
module.exports = async()=>{
  /*
  if(!started){
     await create()
     started = true
  }
  */
  return cmdMapReady
}
