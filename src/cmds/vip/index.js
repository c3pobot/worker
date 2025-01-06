'use strict'
const Cmds = {}
Cmds.cr = require('./cr')
const { replyError, checkVIP } = require('src/helpers')

module.exports = async(obj = {})=>{
  try{
    let auth = await checkVIP(obj, 1)
    if(!auth) return { content: 'This command is only for VIP members' }
    let tempCmd = obj.subCmdGroup || obj.subCmd, opt = obj.data?.options || {}
    let msg2send = { content: 'command not recongnized' }
    if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, opt)
    return msg2send
  }catch(e){
    replyError(obj)
    throw(e)
  }
}
