'use strict'
const Cmds = {}
Cmds.users = require('./users')
Cmds.guilds = require('./guilds')

module.exports = async(obj = {}, patreon = {}, opt = {})=>{
  let tempCmd = obj.subCmd
  let msg2send = { content: 'command not recongnized' }
  if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, patreon, opt)
  return msg2send
}
