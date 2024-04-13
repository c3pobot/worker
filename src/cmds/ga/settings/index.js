'use strict'
const Cmds = {}
Cmds['add-unit'] = require('./addUnit')
Cmds['remove-unit'] = require('./removeUnit')
Cmds.show = require('./show')

module.exports = async(obj = {}, opts = [])=>{
  let tempCmd, opt = []
  for(let i in opts){
    if(Cmds[opts[i].name]){
      tempCmd = opts[i].name
      if(opts[i].options) opt = opts[i].options;
      break;
    }
  }
  let msg2send = {content: 'command not recongnized'}
  if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, opt)
  return msg2send
}
