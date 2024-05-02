'use strict'
const Cmds = {}
Cmds.add = require('./add')
Cmds.remove = require('./remove')
Cmds.show = require('./show')
const { getOptValue } = require('src/helpers')

module.exports = async(obj = {}, opt = {})=>{
  let tempCmd = obj.subCmd
  let msg2send = { content: 'command not recongnized' }
  if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, opt)
  return msg2send
}
