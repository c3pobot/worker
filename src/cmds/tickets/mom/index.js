'use strict'
const Cmds = {}
Cmds.add = require('./add')
Cmds.remove = require('./remove')
Cmds.set = require('./set')
Cmds.show = require('./show')
Cmds.unset = require('./unset')
module.exports = async(obj = {}, opt = {})=>{
  let tempCmd = obj.subCmd, msg2send = { content: 'command not recongnized' }
  if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, opt)
  return msg2send
}
