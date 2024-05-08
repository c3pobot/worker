'use strict'
const Cmds = {}
Cmds.settings = require('./settings')
Cmds.show = require('./show')
module.exports = async(obj = {}, opt = {})=>{
  let tempCmd = obj.subCmd, msg2send = { content: 'command not recongnized' }
  if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, opt)
  return msg2send
}
