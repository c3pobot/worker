'use strict'
const Cmds = {}
Cmds.ability = require('./ability')
Cmds.effects = require('./effects')
Cmds.stats = require('./stats')
Cmds.omicron = require('./omicron')
const { replyError } = require('src/helpers')
module.exports = async(obj = {})=>{
  try{
    let tempCmd = obj.subCmdGroup || obj.subCmd, opt = obj.data?.options || {}
    let msg2send = { content: 'command not recongnized' }
    if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, opt)
    return msg2send
  }catch(e){
    replyError(obj)
    throw(e)
  }
}
