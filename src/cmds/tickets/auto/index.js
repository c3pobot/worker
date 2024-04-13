'use strict'
const Cmds = {}
Cmds.settings = require('./settings')
Cmds.show = require('./show')
module.exports = async(obj, opts = [])=>{
  try{
    let tempCmd, opt = []
    for(let i in opts){
      if(Cmds[opts[i].name]){
        tempCmd = opts[i].name
        if(opts[i].options) opt = opts[i].options
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
