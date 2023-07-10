'use strict'
const Cmds = {}
Cmds.add = require('./add')
Cmds.remove = require('./remove')
module.exports = async(obj, patreon, opt)=>{
  try{
    let tempCmd
    if(opt && opt.find(x=>x.name == 'option')) tempCmd = opt.find(x=>x.name == 'option').value
    if(tempCmd && Cmds[tempCmd]){
      await Cmds[tempCmd](obj, patreon, opt)
    }else{
      HP.ReplyMsg(obj, {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')})
    }
  }catch(e){
    console.log(e)
    HP.ReplyMsg(obj)
  }
}
