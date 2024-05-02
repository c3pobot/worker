'use strict'
const Cmds = {}
Cmds.show = require('./show')
Cmds.clear = require('./clear')
const { getOptValue } = require('src/helpers')

module.exports = async(obj = {}, shard = {}, opt = {}, auth)=>{
  let tempCmd = opt.option?.value || 'show'
  if(tempCmd !== 'show' && !auth) return { content: 'This command requires Shard admin rights' }
  let msg2send = { content: 'command not recongnized' }
  if(Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, shard, opt)
  return msg2send
}
