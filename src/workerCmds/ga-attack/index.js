'use strict'
const { log, ReplyError, ReplyMsg } = require('helpers')
const Cmds = {}
Cmds['3v3'] = '3v3'
Cmds['5v5'] = '5v5'
const attack = require('./attack')
module.exports = async(obj = {})=>{
  try{
    let mode, opt = []
    if(obj.data.options){
      for(let i in obj.data.options){
        if(Cmds[obj.data.options[i].name]){
          mode = obj.data.options[i].name
          if(obj.data.options[i].options) opt = obj.data.options[i].options
          break;
        }
      }
    }
    if(mode){
      await attack(obj, opt, mode)
    }else{
      await ReplyMsg(obj, {content: 'command not recongnized'})
    }
  }catch(e){
    log.error(e);
    ReplyError(obj)
  }
}
