'use strict'
const Cmds = {}
Cmds["5v5"] = require('./5v5')
Cmds["3v3"] = require('./3v3')

module.exports = async(obj = {}, opt = {})=>{
  let tempCmd = obj.subCmd, msg2send = { content: 'command not recongnized' }
  if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, opt)
  return msg2send
}
