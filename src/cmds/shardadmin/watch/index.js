'use strict'
const Cmds = {}
Cmds.clear = require('./clear')
Cmds.remove = require('./remove')
Cmds.set = require('./set')
Cmds.show = require('./show')
module.exports = async(obj = {}, shard = {}, options = {}, auth)=>{
  let tempCmd = obj.subCmd
  let msg2send = { content: 'command not recongnized' }
  if(tempCmd !== 'show' && !auth) return { content: 'This command require Shard admin rights' }
  if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, shard, opt)
  return msg2send
}
