'use strict'
const Cmds = {}
Cmds.all = require('./all')
Cmds.shard = require('./shard')
Cmds.single = require('./single')
const { getOptValue } = require('src/helpers')

module.exports = async(obj = {}, opt = [])=>{
  let tempCmd = getOptValue(opt, 'option')
  let msg2send = {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')}
  if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, opt)
  return msg2send
}
