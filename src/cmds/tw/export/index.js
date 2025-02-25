'use strict'
const Cmds = {}
Cmds.status = require('./status')
Cmds.log = require('./log')

module.exports = async(obj = {}, opt = {})=>{
  let tempCmd = obj.subCmd
  let msg2send = { content: 'command not recongnized' }
  if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, opt)
  return msg2send
}
