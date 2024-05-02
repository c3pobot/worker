'use strict'
const Cmds = {}
Cmds.channel = require('./channel')
Cmds.show = require('./show')
Cmds.enable = require('./enable')
Cmds.disable = require('./disable')

module.exports = async(obj = {}, opt = {}) => {
  let tempCmd = obj.confirm?.subCmd || 'show', msg2send = { content: 'command not recongnized' }
  if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, opt)
  return msg2send
}
