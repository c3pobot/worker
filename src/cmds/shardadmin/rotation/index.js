'use strict'
const Cmds = {}
Cmds.add = require('./add')
Cmds.advance = require('./advance')
Cmds.delete = require('./delete')
Cmds.remove = require('./remove')
Cmds.set = require('./set')
Cmds.send = require('./send')
Cmds.show = require('./show')
module.exports = async(obj = {}, shard = {}, opts = [], auth)=>{
  let tempCmd, opt
  for(let i in options){
    if(Cmds[opts[i].name]){
      tempCmd = opts[i].name
      opt = opts[i].options
      break;
    }
  }
  if(tempCmd !== 'show' && !auth) return {content: 'This command require Shard admin rights'}
  let msg2send = {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')}
  if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, shard, opt)
  return msg2send
}
