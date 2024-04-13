'use strict'
const Cmds = {}
Cmds.add = require('./add')
Cmds.list = require('./list')
Cmds.import = require('./import')
Cmds.remove = require('./remove')
module.exports = async(obj)=>{
  try{
    if(await HP.CheckBotOwner(obj)){
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
        await Cmds[tempCmd](obj, opt)
      }else{
        HP.ReplyMsg(obj, {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')})
      }
    }else{
      HP.ReplyMsg(obj, {content: 'This command is only available to the bot owner'})
    }
  }catch(e){
    HP.ReplyError(obj)
    console.error(e);
  }
}
