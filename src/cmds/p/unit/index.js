'use strict'
const Cmds = {}
Cmds.basic = require('./basic')
Cmds.compare = require('./compare')

module.exports = async(obj = {}, opt = {})=>{
  let tempCmd = 'basic'
  if(opt.gear || opt.rarity) tempCmd = 'compare'
  let msg2send = { content: `command not recongnized` }
  if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, opt)
  return msg2send
}
