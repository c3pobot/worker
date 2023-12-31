'use strict'
const { log, CheckBotOwner, ReplyError, ReplyMsg } = require('helpers')
const Cmds = {}
Cmds.guilds = require('./guilds')
Cmds.global = require('./global')
const UpdateWeb = require('./updateWeb')
module.exports = async(obj = {})=>{
  try{
    if(await CheckBotOwner(obj)){
      let tempCmd
      if(obj.data && obj.data.options){
        for(let i in obj.data.options){
          if(Cmds[obj.data.options[i].value]){
            tempCmd = obj.data.options[i].value
            break
          }
        }
      }
      if(tempCmd && Cmds[tempCmd]){
        await Cmds[tempCmd](obj)
        await UpdateWeb()
      }else{
        await ReplyMsg(obj, {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')})
      }
    }else{
      await ReplyMsg(obj, {content: 'This command is only available to the bot owner'})
    }
  }catch(e){
    log.error(e)
    ReplyError(obj);
  }
}
