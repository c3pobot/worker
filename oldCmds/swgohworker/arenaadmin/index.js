'use strict'
const Cmds = {}
Cmds.add = require('./add')
Cmds.edit = require('./edit')
Cmds.remove = require('./remove')
Cmds.show = require('./show')
module.exports = async(obj)=>{
  if(await HP.CheckBotOwner(obj)){
    let tempCmd, opt
    if(obj.data && obj.data.options && obj.data.options.find(x=>x.name == 'option')) tempCmd = obj.data.options.find(x=>x.name == 'option').value
    if(tempCmd && Cmds[tempCmd]){
      await Cmds[tempCmd](obj, obj.data.options)
    }else{
      HP.ReplyMsg(obj, {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')})
    }
  }else{
    HP.ReplyMsg(obj, {content: 'This command is only available to the bot owner'})
  }
}
