'use strict'
const Cmds = {}
Cmds.quality = require('./quality')
Cmds.member = require('./member')
Cmds.unit = require('./unit')
Cmds.update = require('./update')

module.exports = async(obj = {}, opt = {})=>{
  let tempCmd = obj.subCmd
  let msg2send = { content: 'command not recongnized' }
  if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, opt)
  return msg2send
}
