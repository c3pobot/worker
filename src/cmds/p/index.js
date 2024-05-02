'use strict'
const Cmds = {}
Cmds.arena = require('./arena')
Cmds.compare = require('./compare')
Cmds.gear = require('./gear')
Cmds['gear-relic'] = require('./relic')
Cmds.mods = require('./mods')
Cmds.omicron = require('./omicron')
Cmds.report = require('./report')
Cmds.stats = require('./stats')
Cmds.unit = require('./unit')
Cmds['unit-compare'] = require('./unitCompare')
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
