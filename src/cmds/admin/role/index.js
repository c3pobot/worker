'use strict'
const Cmds = {}
Cmds.add = require('./add')
Cmds.remove = require('./remove')

const { checkServerAdmin } = require('src/helpers')

module.exports = async(obj = {}, opt = {})=>{
  let auth = await checkServerAdmin(obj)
  if(!auth) return { content: 'This command requires bot server admin role' }
  let tempCmd = obj.subCmd, msg2send = { content: 'command not recongnized' }
  if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, opt)
  return msg2send
}
