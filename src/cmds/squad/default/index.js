'use strict'
const Cmds = {}
Cmds['add-unit'] = require('./add-unit')
Cmds['remove-unit'] = require('./remove-unit')
Cmds['show-units'] = require('./show-units')

module.exports = async(obj = {}, opt = {})=>{
  let tempCmd = obj.subCmd
  let msg2send = { content: 'command not recongnized' }
  if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, opt)
  return msg2send
}
