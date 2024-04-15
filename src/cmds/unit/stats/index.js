'use strict'
const Cmds = {}
Cmds.basic = require('./basic')
Cmds.compare = require('./compare')
module.exports = async(obj = {}, opt = [])=>{
  let tempCmd = 'basic'
  if(opt.filter(x=>x.name == 'gear1' || x.name == 'gear2').length > 1) tempCmd = 'compare'
  let msg2send = {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')}
  if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, opt)
  return msg2send
}
