'use strict'
const { log, CheckBotOwner, ReplyError, ReplyMsg } = require('helpers')
const Cmds = {}
Cmds.syncguild = require('./syncguild')
Cmds.updatedata = require('./updatedata')
Cmds.updateweather = require('./updateweather')
module.exports = async(obj = {})=>{
  try{
    let auth = CheckBotOwner(obj)
    if(auth){
      let tempCmd, opt
      if(obj.data && obj.data.options){
        for(let i in obj.data.options){
          if(Cmds[obj.data.options[i].name]){
            tempCmd = obj.data.options[i].name
            opt = obj.data.options[i].options
            break;
          }
        }
      }
      if(tempCmd){
        await Cmds[tempCmd](obj, opt)
      }else{
        await ReplyMsg(obj, {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')})
      }
    }else{
      await ReplyMsg(obj, {content: 'This command is only available to the bot owner'})
    }
  }catch(e){
    log.error(e)
    ReplyError(obj)
  }
}
