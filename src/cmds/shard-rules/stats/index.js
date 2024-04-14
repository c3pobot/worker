'use strict'
const Cmds = {}
Cmds.show = require('./show')
Cmds.clear = require('./clear')
const { getOptValue } = require()

module.exports = async(obj = {}, shard = {}, opt = [], auth)=>{
  let tempCmd = getOptValue(opt, 'option', 'show')
  if(tempCmd !== 'show' && !auth) return {content: 'This command requires Shard admin rights'}
  let msg2send = {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')}
  if(Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, shard, opt)
  return msg2send
}
