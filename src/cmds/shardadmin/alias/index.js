'use strict'
const Cmds = {}
Cmds.add = require('./add')
Cmds.show = require('./show')
Cmds.remove = require('./remove')

module.exports = async(obj = {}, shard = {}, options = {}, auth)=>{
  let tempCmd = obj.subCmd
  let msg2send = { content: 'command not recongnized' }
  if(tempCmd !== 'show' && !auth) return { content: 'This command require Shard admin rights' }
  if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, shard, opt)
  return msg2send
}
