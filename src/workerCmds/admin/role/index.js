'use strict'
const { ReplyMsg, AdminNotAuth, CheckServerAdmin } = require('helpers')
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
      if(await CheckServerAdmin(obj)){
        await Cmds[tempCmd](obj, opts)
      }else{
        AdminNotAuth(obj)
      }
    }else{
      ReplyMsg(obj, {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')})
    }
  }catch(e){
    throw(e)
  }
}
