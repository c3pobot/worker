'use strict'
const Cmds = {}
//Cmds.global = require('./global')
//Cmds.guilds = require('./guilds')
Cmds['add-guild-cmds'] = require('./add-guild-cmds')
const updateWeb = require('./updateWeb')
const { replyError, checkBotOwner } = require('src/helpers')
module.exports = async(obj = {})=>{
  try{
    let auth = checkBotOwner(obj)
    if(!auth) return { content: 'This command is only available to the bot owner' }
    let opt = obj.data?.options || {}
    let tempCmd = opt.update?.value
    let msg2send = { content: 'command not recongnized' }
    if(tempCmd && Cmds[tempCmd]){
      msg2send = await Cmds[tempCmd](obj, opt)
      await updateWeb()
    }
    return msg2send
  }catch(e){
    replyError(obj)
    throw(e)
  }
}
