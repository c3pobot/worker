'use strict'
const Cmds = {}
Cmds['admin-messages'] = require('./adminMessages')
Cmds.general = require('./general')
Cmds.payouts = require('./payouts')
Cmds.ranks = require('./ranks')

module.exports = async(obj = {}, shard = {}, opt = {}, auth)=>{
  let tempCmd = obj.subCmd
  let msg2send = { content: 'command not recongnized' }
  if(tempCmd !== 'show' && !auth) return { content: 'This command require Shard admin rights' }
  if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, shard, opt)
  return msg2send
}
