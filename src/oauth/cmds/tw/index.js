'use strict'
const Cmds = {}
Cmds['attack-log'] = require('./attack-log')
Cmds.defense = require('./defense')
Cmds.enemy = require('./enemy')
Cmds.omicron = require('./omicron')
Cmds.report = require('./report')
Cmds['report-units'] = require('src/cmds/g/units')
Cmds.member = require('./member')
Cmds.preload = require('./preload')
Cmds.status = require('./status')
Cmds.stats = require('./stats')
const { replyError } = require('src/helpers')

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
    return msg2send
  }catch(e){
    replyError(obj)
    throw(e)
  }
}
