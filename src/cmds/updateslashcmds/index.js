'use strict'
const Cmds = {}
Cmds.global = require('./global')
Cmds.guilds = require('./guilds')
Cmds['add-guild-cmds'] = require('./add-guild-cmds')
const updateWeb = require('./updateWeb')
const { replyError, checkBotOwner } = require('src/helpers')
module.exports = async(obj = {})=>{
  try{
    let auth = checkBotOwner(obj)
    if(!auth) return { content: 'This command is only available to the bot owner' }
    let tempCmd
    if(obj.data?.options){
      for(let i in obj.data.options){
        if(Cmds[obj.data.options[i].value]){
          tempCmd = obj.data.options[i].value
          break;
        }
      }
    }
    let msg2send = { content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided') }
    if(tempCmd && Cmds[tempCmd]){
      msg2send = await Cmds[tempCmd](obj)
      await updateWeb()
    }
    return msg2send
  }catch(e){
    replyError(obj)
    throw(e)
  }
}
