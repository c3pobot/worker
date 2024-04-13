'use strict'
const Cmds = {}
Cmds.settings = require('./settings')
Cmds.status = require('./status')
module.exports = (obj, shard, options = [])=>{
  try{
    let tempCmd, opt
    for(let i in options){
      if(Cmds[options[i].name]){
        tempCmd = options[i].name
        opt = options[i].options
        break;
      }
    }
    if(tempCmd && Cmds[tempCmd]){
      Cmds[tempCmd](obj, shard, opt)
    }else{
      HP.ReplyMsg(obj, {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')})
    }
  }catch(e){
    console.error(e)
    HP.ReplyError(obj)
  }
}
