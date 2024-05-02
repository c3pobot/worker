'use strict'
const Cmds = {}
Cmds.add = require('./add')
Cmds.channel = require('./channel')
Cmds.remove = require('./remove')

module.exports = async(obj = {}, patreon = {}, opt = {})=>{
  let tempCmd = obj.subCmd
  let msg2send = { content: 'command not recongnized' }
  if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, patreon, opt)
  return msg2send
}
