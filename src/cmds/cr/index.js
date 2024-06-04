'use strict'
const Cmds = {}
Cmds.add = require('./add')
Cmds.clear = require('./clear')
//Cmds.copy = require('./copy')
Cmds.edit = require('./edit')
Cmds.list = require('./list')
Cmds.remove = require('./remove')
const { checkServerAdmin, replyError, adminNoAuth } = require('src/helpers')
module.exports = async(obj = {})=>{
  try{
    let auth = await checkServerAdmin(obj)
    let tempCmd = obj.subCmdGroup || obj.subCmd, opt = obj.data?.options || {}
    let msg2send = { content: 'command not recongnized' }
    if(!tempCmd || !Cmds[tempCmd]) return msg2send
    if(auth || tempCmd === 'list' || tempCmd === 'copy'){
      msg2send = await Cmds[tempCmd](obj, opt)
      return msg2send
    }
    await adminNotAuth(obj)
  }catch(e){
    replyError(obj)
    throw(e)
  }
}
