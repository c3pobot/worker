'use strict'
const Cmds = {}
Cmds.add = require('./add')
Cmds.edit = require('./edit')
Cmds.list = require('./list')
Cmds.remove = require('./remove')
module.exports = async(obj)=>{
  try{
    const auth = await HP.CheckBotOwner(obj)
    let tempCmd, opt
    if(obj.data && obj.data.options){
      for(let i in obj.data.options){
        if(Cmds[obj.data.options[i].name]){
          tempCmd = obj.data.options[i].name
          opt = obj.data.options[i].options
          break
        }
      }
    }
    if(tempCmd && Cmds[tempCmd]){
      if(auth || tempCmd === 'list'){
        await Cmds[tempCmd](obj, opt)
      }else{
        HP.ReplyMsg(obj, {content: 'This command is only available to the bot owner'})
      }
    }else{
      HP.ReplyMsg(obj, {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')})
    }
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
