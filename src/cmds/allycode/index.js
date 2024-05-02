'use strict'
const { replyError } = require('src/helpers')
const Cmds = {}
Cmds.add = require('./add')
Cmds.auth = require('./auth')
Cmds.clean = require('./clean')
Cmds.remove = require('./remove')
Cmds.set = require('./set')
Cmds.show = require('./show')

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
