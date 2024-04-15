'use strict'
const Cmds = {}
Cmds.settings = require('./settings')
Cmds.show = require('./show')
module.exports = async(obj = {}, opts = [])=>{
  let tempCmd, opt = []
  for(let i in opts){
    if(Cmds[opts[i].name]){
      tempCmd = opts[i].name
      if(opts[i].options) opt = opts[i].options
      break;
    }
  }
  let msg2send = {content: 'Command not recognized'}
  if(tempCmd) msg2send = await Cmds[tempCmd](obj, opt)
  return msg2send
}
