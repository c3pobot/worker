'use strict'
const Cmds = {}
Cmds.all = require('./all')
Cmds.shard = require('./shard')
Cmds.single = require('./single')
module.exports = async(obj, opt)=>{
  try{
    let tempCmd
    if(opt.find(x=>x.name == 'option')) tempCmd = opt.find(x=>x.name == 'option').value
    if(tempCmd && Cmds[tempCmd]){
      Cmds[tempCmd](obj, opt)
    }else{
      HP.ReplyMsg(obj, {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')})
    }
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
