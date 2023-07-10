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
module.exports = async(obj)=>{
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
    if(tempCmd && Cmds[tempCmd]){
      await Cmds[tempCmd](obj, opt)
    }else{
      HP.ReplyMsg(obj, {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')})
    }
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
