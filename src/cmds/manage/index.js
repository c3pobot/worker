'use strict'
const Cmds = {}
Cmds.vip = require('./vip')
const { checkBotOwner, replyError } = require('src/helpers')

module.exports = async(obj = {})=>{
  try{
    let auth = checkBotOwner(obj)
    if(!auth) return { content: 'This command is only available to the bot owner' }
    let tempCmd = obj.subCmdGroup || obj.subCmd, opt = obj.data?.options || {}
    let msg2send = { content: 'command not recongnized' }
    if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, opt)
    return msg2send
  }catch(e){
    replyError(obj)
    throw(e)
  }
}
