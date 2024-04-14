'use strict'
const Cmds = {}
Cmds.add = require('./add')
Cmds.clear = require('./clear')
Cmds.remove = require('./remove')
Cmds.settings = require('./settings')
Cmds.show = require('./show')
module.exports = async(obj = {}, shard = {}, options = [], auth)=>{
  let tempCmd, opt
  for(let i in options){
    if(Cmds[options[i].name]){
      tempCmd = options[i].name
      opt = options[i].options
      break;
    }
  }
  let msg2send = {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')}
  if(tempCmd !== 'show' && !auth) return {content: 'This command require Shard admin rights'}
  if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, shard, opt)
  return msg2send
}
