'use strict'
const { log, CheckBotOwner, GetOptValue, ReplyError, ReplyMsg } = require('helpers')
const Cmds = {}
Cmds.add = require('./add')
Cmds.edit = require('./edit')
Cmds.remove = require('./remove')
Cmds.show = require('./show')
module.exports = async(obj = {})=>{
  try{
    let auth = CheckBotOwner(obj)
    if(auth){
      let tempCmd = GetOptValue(obj?.data?.options, 'option')
      if(tempCmd && Cmds[tempCmd]){
        await Cmds[tempCmd](obj, obj?.data?.options)
      }else{
        ReplyMsg(obj, {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')})
      }
    }else{
      ReplyMsg(obj, {content: 'This command is only available to the bot owner'})
    }
  }catch(e){
    log.error(e)
    ReplyError(obj)
  }
}
