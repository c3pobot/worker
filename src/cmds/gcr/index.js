'use strict'
const Cmds = {}
Cmds.add = require('./add')
Cmds.edit = require('./edit')
Cmds.list = require('./list')
Cmds.remove = require('./remove')
const { checkBotOwner, replyError } = require('src/helpers')
module.exports = async(obj = {})=>{
  try{
    let tempCmd = obj.subCmdGroup || obj.subCmd, opt = obj.data?.options || {}
    let msg2send = { content: 'command not recongnized' }
    if(!tempCmd || !Cmds[tempCmd]) return msg2send
    let auth = checkBotOwner(obj)
    msg2send = {content: 'This command is only available to the bot owner'}
    if(auth || tempCmd === 'list') msg2send = await Cmds[tempCmd](obj, opt)
    return msg2send
  }catch(e){
    replyError(obj)
    throw(e)
  }
}
