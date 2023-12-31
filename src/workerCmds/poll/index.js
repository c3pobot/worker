'use strict'
const log = require('logger')
const { mongo, ReplyError, ReplyMsg } = require('helpers')
const Cmds = {}
Cmds.create = require('./create')
Cmds.stats = require('./stats')
Cmds.show = require('./show')
Cmds.end = require('./end')
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
    if(tempCmd && Cmds[tempCmd]){
      await Cmds[tempCmd](obj, opt)
    }else{
      await ReplyMsg(obj, {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')})
    }
  }catch(e){
    log.error(e)
    ReplyError(obj)
  }
}
