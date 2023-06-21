'use strict'
const Cmds = {}
Cmds.alt = require('./alt')
Cmds.main = require('./main')
Cmds.join = require('./join')
module.exports = async(obj)=>{
  try{
    const auth = await HP.CheckServerAdmin(obj)
    if(auth){
      let tempCmd, opt
      if(obj.data.options){
        if(obj.data.options.find(x=>x.name == 'type')) tempCmd = obj.data.options.find(x=>x.name == 'type').value
        opt = obj.data.options
      }
      if(tempCmd && Cmds[tempCmd]){
        await Cmds[tempCmd](obj, opt)
      }else{
        HP.ReplyMsg(obj, {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')})
      }
    }else{
      HP.AdminNotAuth(obj)
    }
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
