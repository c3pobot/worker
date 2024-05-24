'use strict'
const Cmds = {}
Cmds.basic = require('./basic')
Cmds.compare = require('./compare')
module.exports = async(obj = {}, opt = {})=>{
  let tempCmd = 'basic', msg2send = { content: 'command not recongnized' }
  if(opt.relic_level_2?.value || opt.gear_level_2?.value) tempCmd = 'compare'
  if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, opt)
  return msg2send
}
