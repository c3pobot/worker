'use strict'
const Cmds = {}
Cmds.google = require('./google')
Cmds.guest = require('./guest')
Cmds.remove = require('./remove')

module.exports = async(obj = {}, opts = [])=>{
  let tempCmd, opt = [], msg2send = {content: 'command not recongnized'}
  for(let i in opts){
    if(Cmds[opts[i].name]){
      tempCmd = opts[i].name
      if(opts[i].options) opt = opts[i].options;
      break;
    }
  }
  if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, opt)
  return msg2send
}
