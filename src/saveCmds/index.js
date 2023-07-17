'use strict'
const log = require('logger')
const path = require('path')
const { mongo } = require('helpers/mongo')
const ReadFiles = require('./readFiles')
const GetCmdArray = async()=>{
  try{
    const cmdArray = await ReadFiles(path.join(baseDir, 'src', 'workerCmds'))
    if(cmdArray){
      for(let i in cmdArray){
        if(!cmdArray[i]) continue;
        await mongo.rep('slashCmds', {_id: i}, cmdArray[i])
        log.info('saved '+i+' cmds to mongo')
      }
    }else{
      log.info('Did not find any commands. Will try again in 5 seconds')
      setTimeout(()=>GetCmdArray(), 5000)
    }
  }catch(e){
    log.error(e)
    setTimeout(()=>GetCmdArray(), 5000)
  }
}
module.exports = GetCmdArray
