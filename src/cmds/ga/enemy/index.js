'use strict'
const Cmds = {}
Cmds.change = require('./change')
Cmds.clear = require('./clear')
Cmds['faction-basic'] = require('./faction-basic')
Cmds['faction-stats'] = require('./faction-stats')
Cmds.history = require('./history')
Cmds.show = require('./show')
Cmds.unit = require('./unit')
Cmds.update = require('./update')

module.exports = async(obj = {}, opt = {})=>{
  let tempCmd = obj.subCmd, msg2send = { content: 'command not recongnized' }
  if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, opt)
  return msg2send
}
