'use strict'
const Cmds = {}
Cmds.add = require('./add')
Cmds.remove = require('./remove')
const { getOptValue } = require('src/helpers')

module.exports = async(obj = {}, patreon = {}, opt = [])=>{
  let tempCmd = getOptValue(opt, 'option')
  let msg2send = {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')}
  if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, patreon, opt)
  return msg2send
}
