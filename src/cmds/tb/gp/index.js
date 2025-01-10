'use strict'
const Cmds = {}
Cmds.char = require('./char')
//Cmds.low = require('./low')
Cmds.total = require('./total')

module.exports = async(obj = {}, opt = {})=>{
  let tempCmd = obj.subCmd, msg2send = { content: 'command not recongnized' }
  if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, opt)
  return msg2send
}
