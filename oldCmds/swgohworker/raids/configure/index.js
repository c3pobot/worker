'use strict'
const Cmds = {}
Cmds.add = require('./add')
Cmds.remove = require('./remove')
Cmds.show = require('./show')
module.exports = async(obj, opt, guild)=>{
  try{
    let tempCmd
    if(opt && opt.find(x=>x.name == 'option')) tempCmd = opt.find(x=>x.name == 'option').value
    if(tempCmd && Cmds[tempCmd]){
      Cmds[tempCmd](obj, opt, guild)
    }else{
      HP.ReplyMsg(obj, {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')})
    }
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
