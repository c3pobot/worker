'use strict'
const Cmds = {}
Cmds.auto = require('./auto')
Cmds.missed = require('./missed')
Cmds.mom = require('./mom')
Cmds.sendmessages = require('./sendmessages')
Cmds.check = require('./check')
module.exports = async(obj)=>{
  try{
    let opt = [], tempCmd
    for(let i in obj.data.options){
      if(Cmds[obj.data.options[i].name]){
        tempCmd = obj.data.options[i].name
        if(obj.data.options[i].options) opt = obj.data.options[i].options
        break;
      }
    }
    if(tempCmd){
      await Cmds[tempCmd](obj, opt)
    }else{
      HP.ReplyMsg(obj, {content: 'Command not recognized'})
    }
  }catch(e){
    console.error(e)
    HP.ReplyError(obj)
  }
}
