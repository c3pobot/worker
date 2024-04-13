'use strict'
const Cmds = {}
Cmds.cache = require('./cache')
Cmds.enemy = require('./enemy')
Cmds.faction = require('./faction')
Cmds.history = require('./history')
Cmds.report = require('./report')
Cmds.settings = require('./settings')
Cmds.squad = require('./squad')
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
          break;
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
