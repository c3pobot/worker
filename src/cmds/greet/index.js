'use strict'
const Cmds = {}
Cmds.alt = require('./alt')
Cmds.main = require('./main')
Cmds.join = require('./join')

const { checkServerAdmin, adminNoAuth, replyError } = require('src/helpers')

module.exports = async(obj = {})=>{
  try{
    let auth = await checkServerAdmin(obj)
    if(!auth){
      await adminNoAuth(obj)
      return
    }
    let tempCmd = obj.data?.options?.type?.value, opt = obj.data?.options || {}
    let msg2send = { content: 'command not recongnized' }
    if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, opt)
    return msg2send
  }catch(e){
    replyError(obj)
    throw(e)
  }
}
