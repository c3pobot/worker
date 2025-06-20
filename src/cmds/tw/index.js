'use strict'
const PRIVATE_WORKER = process.env.PRIVATE_WORKER
const rabbitmq = require('src/rabbitmq')
const Cmds = {}
Cmds['attack-log'] = require('./attack-log')
Cmds.banners = require('./banners')
Cmds.export = require('./export')
Cmds.defense = require('./defense')
Cmds.opponent = require('./opponent')
Cmds.member = require('./member')
Cmds.preload = require('./preload')
Cmds['report-units'] = require('src/cmds/g/report-units')
Cmds.status = require('./status')
Cmds.stats = require('./stats')
const { replyError } = require('src/helpers')

module.exports = async(obj = {})=>{
  try{
    let tempCmd = obj.subCmdGroup || obj.subCmd, opt = obj.data?.options || {}
    let msg2send = { content: 'command not recongnized' }
    if(!tempCmd) return msg2send
    if(!Cmds[tempCmd]){
      obj.cmd = 'tw-guild'
      await rabbitmq.add('tw-guild', obj)
      return
    }
    if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, opt)
    return msg2send
  }catch(e){
    replyError(obj)
    throw(e)
  }
}
