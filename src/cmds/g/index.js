'use strict'
const Cmds = {}
Cmds['gear-relic'] = require('./relic')
Cmds.quality = require('./quality')
Cmds['report-units'] = require('./report-units')
Cmds.link = require('./link')
Cmds.omicron = require('./omicron')
Cmds.member = require('./member')
Cmds.report = require('./report')
Cmds.unit = require('./unit')
Cmds.unlink = require('./unlink')
const { replyError } = require('src/helpers')

module.exports = async(obj = {})=>{
  try{
    let tempCmd = obj.subCmdGroup || obj.subCmd, opt = obj.data?.options || {}
    let msg2send = { content: 'command not recongnized' }
    if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, opt)
    return msg2send
  }catch(e){
    replyError(obj)
    throw(e)
  }
}
