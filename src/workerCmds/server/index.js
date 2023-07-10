'use strict'
const log = require('logger')
const { CheckBotOwner, GetOptValue, ReplyError, ReplyMsg } = require('helpers')
const Cmds = {}
Cmds.basic = require('./basic')
Cmds.all = require('./all')
Cmds.private = require('./private')
module.exports = async(obj = {})=>{
  try{
    if(await CheckBotOwner(obj)){
      let opt
      if(obj.data.options) opt = obj.data.options
      let tempCmd = await GetOptValue(opt, 'option')
      if(tempCmd && Cmds[tempCmd]){
        await Cmds[tempCmd](obj, opt)
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
