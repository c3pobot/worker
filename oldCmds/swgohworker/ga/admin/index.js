'use strict'
const Cmds = {}
Cmds.counter = require('./counter')
Cmds.history = require('./history')
module.exports = async(obj, opts = [])=>{
  try{
    let tempCmd, opt = []
    let auth = await HP.CheckSuperAdmin(obj)
    if(auth){
      for(let i in opts){
        if(Cmds[opts[i].name]){
          tempCmd = opts[i].name
          if(opts[i].options) opt = opts[i].options;
          break;
        }
      }
      if(tempCmd && Cmds[tempCmd]){
        await Cmds[tempCmd](obj, opt)
      }else{
        HP.ReplyMsg(obj, {content: '/ga admin command not recongnized'})
      }
    }else{
      HP.ReplyMsg(obj, {content: 'This command is only avaliable to Bot Owner'})
    }

  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
