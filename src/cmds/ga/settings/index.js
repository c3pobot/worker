'use strict'
const Cmds = {}
Cmds['add-unit'] = require('./addUnit')
Cmds['remove-unit'] = require('./removeUnit')
Cmds.show = require('./show')

module.exports = async(obj = {}, opts = {})=>{
  let tempCmd = obj.subCmd, msg2send = { content: 'command not recongnized' }
  if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, opts)
  return msg2send
}
