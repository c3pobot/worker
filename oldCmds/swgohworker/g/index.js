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
