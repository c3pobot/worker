'use strict'
const log = require('logger')
const { CheckBotOwner, GetOptValue, ReplyError, ReplyMsg } = require('helpers')
const Cmds = {}
Cmds.channel = require('./channel')
Cmds.guild = require('./guild')
Cmds.user = require('./user')
module.exports = async(obj)=>{
  try{
    const auth = await CheckBotOwner(obj)
    let tempCmd, opt
    if(obj && obj.data && obj.data.options){
      if(auth){
        opt = obj.data.options
        tempCmd = await GetOptValue(opt, 'option')
        if(tempCmd && Cmds[tempCmd]){
          await Cmds[tempCmd](obj, opt)
        }else{
          ReplyMsg(obj, {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')})
        }
      }else{
        ReplyMsg(obj, {content: 'This command is only available to the bot owner'})
      }
    }
  }catch(e){
    log.error(e)
    ReplyError(obj)
  }
}
