'use strict'
const ReadFiles = require('./readFiles')
const GetCmdArray = async(dir, dbKey)=>{
  try{
    const cmdArray = await ReadFiles(dir)
    if(cmdArray){
      for(let i in cmdArray){
        if(!cmdArray[i]) continue;
        //await mongo.rep('slashCmds', {_id: i}, cmdArray[i])
        console.log('saved '+i+' cmds to mongo')
      }
    }else{
      console.log('Did not find any commands. Will try again in 5 seconds')
      setTimeout(()=>GetCmdArray(dir, dbKey), 5000)
    }
  }catch(e){
    console.error(e)
    setTimeout(()=>GetCmdArray(dir, dbKey), 5000)
  }
}
module.exports = GetCmdArray
