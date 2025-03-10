'use strict'
const Cmds = {}
Cmds.add = require('./add')
Cmds.list = require('./list')
Cmds.remove = require('./remove')
Cmds.edit = require('./edit')
module.exports = async(obj = {}, opt = {})=>{
  let tempCmd = obj.subCmd
  let msg2send = { content: 'command not recongnized' }
  if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, opt)
  return msg2send
}
