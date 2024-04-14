'use strict'
const Cmds = {}
Cmds.add = require('./add')
Cmds.show = require('./show')
Cmds.remove = require('./remove')

module.exports = async(obj = {}, shard = {}, options = [], auth)=>{
  let tempCmd, opt
  for(let i in options){
    if(Cmds[options[i].name]){
      tempCmd = options[i].name
      if(options[i].options) opt = options[i].options
      break;
    }
  }
  let msg2send = {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')}
  if(tempCmd !== 'show' && !auth) return {content: 'This command require Shard admin rights'}
  if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, shard, opt, auth)
  return msg2send
}
