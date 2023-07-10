'use strict'
const Cmds = {}
Cmds.admin = require('./admin')
Cmds.cache = require('./cache')
Cmds.enemy = require('./enemy')
Cmds.faction = require('./faction')
Cmds.history = require('./history')
Cmds.report = require('./report')
Cmds.settings = require('./settings')
Cmds.squad = require('./squad')
Cmds.unit = require('./unit')
module.exports = async(obj)=>{
  try{
    let tempCmd, opt = []
    if(obj.data.options){
      for(let i in obj.data.options){
        if(Cmds[obj.data.options[i].name]){
          tempCmd = obj.data.options[i].name
          if(obj.data.options[i].options) opt = obj.data.options[i].options
          break;
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
