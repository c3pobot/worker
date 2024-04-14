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
