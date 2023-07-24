'use strict'
const { ReplyMsg } = require('helpers')
const Cmds = {}
Cmds.add = require('./add')
Cmds.edit = require('./edit')
Cmds.remove = require('./remove')
module.exports = async(obj = {}, opt = [])=>{
  try{
    let tempCmd, options = []
    for(let i in opt){
      if(Cmds[opt[i].name]){
        tempCmd = opt[i].name
        if(opt[i].options) options = opt[i].options
        break;
      }
    }
    if(tempCmd && Cmds[tempCmd]){
      await Cmds[tempCmd](obj, options)
    }else{
      await ReplyMsg(obj, {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')})
    }
  }catch(e){
    throw(e)
  }
}
