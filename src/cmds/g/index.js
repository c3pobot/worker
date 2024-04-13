'use strict'
const Cmds = {}
Cmds['gear-relic'] = require('./relic')
Cmds.quality = require('./quality')
Cmds['report-units'] = require('./units')
Cmds.link = require('./link')
Cmds.omicron = require('./omicron')
Cmds.member = require('./member')
Cmds.report = require('./report')
Cmds.unit = require('./unit')
const { replyMsg, replyError } = require('src/helpers')

module.exports = async(obj = {})=>{
  try{
    let tempCmd, opt = []
    if(obj.data.options){
      for(let i in obj.data.options){
        if(Cmds[obj.data.options[i].name]){
          tempCmd = obj.data.options[i].name
          if(obj.data.options[i].options) opt = obj.data.options[i].options
        }
      }
    }
    let msg2send = {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')}
    if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, opt)
    if(msg2send) await replyMsg(obj, msg2send)
  }catch(e){
    replyError(obj)
    throw(e)
  }
}
