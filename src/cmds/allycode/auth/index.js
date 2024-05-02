'use strict'
const Cmds = {}
Cmds.code = require('./code')
Cmds.android = require('./android')
Cmds.remove = require('./remove')

module.exports = async(obj = {}, opt = {})=>{
  let tempCmd = obj.subCmd
  let msg2send = { content: 'command not recongnized' }
  if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, opt)
  return msg2send
}
