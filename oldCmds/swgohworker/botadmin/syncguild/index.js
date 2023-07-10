'use strict'
const Cmds = {}
Cmds.add = require('./add')
Cmds.remove = require('./remove')
module.exports = async(obj, opt = [])=>{
  try{
    let tempCmd = HP.GetOptValue(opt, 'action')
    if(tempCmd){
      await Cmds[tempCmd](obj, opt)
    }else{
      HP.ReplyMsg(obj, {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')})
    }
  }catch(e){
    console.error(e);
    HP.ReplyError(obj)
  }
}
