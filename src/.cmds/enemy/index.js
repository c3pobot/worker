'use strict'
const Cmds = {}
Cmds.quality = require('./quality')
Cmds.member = require('./member')
Cmds.unit = require('./unit')
Cmds.update = require('./update')
module.exports = async(obj = {}, opt = [])=>{
  let tempCmd, opts = []
  for(let i in opt){
    if(Cmds[opt[i].name]){
      tempCmd = opt[i].name
      if(opt[i].options) opts = opt[i].options
      break;
    }
  }
  let msg2send = {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')}
  if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, opts)
  return msg2send
}
