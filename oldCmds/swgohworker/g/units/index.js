'use strict'
const Cmds = {}
Cmds.add = require('./add')
Cmds.remove = require('./remove')
module.exports = async(obj, opt = [])=>{
  try{
    let tempCmd
    if(opt.find(x=>x.name == 'option')) tempCmd = opt.find(x=>x.name == 'option').value
    if(tempCmd && Cmds[tempCmd]){
      if(await HP.CheckGuildAdmin(obj, opt, null)){
        await Cmds[tempCmd](obj, opt)
      }else{
        HP.ReplyMsg(obj, {content: "This command is only avaliable to guild Admins"})
      }
    }else{
      HP.ReplyMsg(obj, {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')})
    }
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
