'use strict'
const path = require('path')
const { mongo } = require('helpers/mongo')
const ReadFiles = require('./readFiles')
const GetCmdArray = async()=>{
  try{
    const cmdArray = await ReadFiles(path.join(baseDir, 'src', 'workerCmds'))
    if(cmdArray){
      for(let i in cmdArray){
        if(!cmdArray[i]) continue;
        //await mongo.rep('slashCmds', {_id: i}, cmdArray[i])
        console.log('saved '+i+' cmds to mongo')
      }
    }else{
      console.log('Did not find any commands. Will try again in 5 seconds')
      setTimeout(()=>GetCmdArray(), 5000)
    }
  }catch(e){
    console.error(e)
    setTimeout(()=>GetCmdArray(), 5000)
  }
}
module.exports = GetCmdArray
