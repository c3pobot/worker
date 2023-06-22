'use strict'
const Cmds = {}
Cmds.add = require('./add')
Cmds.remove = require('./remove')
module.exports = async(obj = {}, opt = [])=>{
  try{
    let tempCmd, opts = []
    for(let i in opt){
      if(Cmds[opt[i].name]){
        tempCmd = opt[i].name
        if(opt[i].options) opts = opt[i].options
        break
      }
    }
    if(tempCmd && Cmds[tempCmd]){
      if(await HP.CheckServerAdmin(obj)){
        await Cmds[tempCmd](obj, opts)
      }else{
        HP.AdminNotAuth(obj)
      }
    }else{
      HP.ReplyMsg(obj, {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')})
    }
  }catch(e){
    console.error(e)
    HP.ReplyError(obj)
  }
}
