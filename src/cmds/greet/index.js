'use strict'
const Cmds = {}
Cmds.alt = require('./alt')
Cmds.main = require('./main')
Cmds.join = require('./join')
module.exports = async(obj = {})=>{
  try{
    const auth = await HP.CheckServerAdmin(obj)
    if(auth){
      const tempCmd = await HP.GetOptValue(obj.data?.options)
      const opt = obj.data?.options
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
