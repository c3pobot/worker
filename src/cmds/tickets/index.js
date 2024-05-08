'use strict'
const Cmds = {}
Cmds.auto = require('./auto')
Cmds.missed = require('./missed')
Cmds.mom = require('./mom')
Cmds.sendmessages = require('./sendmessages')
Cmds.check = require('./check')
const { replyError } = require('src/helpers')
module.exports = async(obj = {})=>{
  try{
    let tempCmd = obj.subCmdGroup || obj.subCmd, opt = obj.data?.options || {}, msg2send = { content: 'command not recongnized' }
    if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, opt)
    return msg2send
  }catch(e){
    replyError(obj)
    throw(e)
  }
}
