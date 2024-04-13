'use strict'
const Cmds = {}
Cmds.clear = require('./clear')
Cmds.change = require('./change')
Cmds['faction-basic'] = require('./factionbasic')
Cmds['faction-stats'] = require('./factionstats')
Cmds.history = require('./history')
Cmds.show = require('./show')
Cmds.unit = require('./unit')
Cmds.update = require('./update')

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
