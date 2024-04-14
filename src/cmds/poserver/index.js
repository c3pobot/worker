'use strict'
const Cmds = {}
Cmds.add = require('./add')
Cmds.list = require('./list')
Cmds.import = require('./import')
Cmds.remove = require('./remove')
const { checkBotOwner, replyError } = require('src/helpers')
module.exports = async(obj = {})=>{
  try{
    let auth = checkBotOwner(obj)
    if(!auth) return {content: 'This command is only available to the bot owner'}
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
    let msg2send = {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')}
    if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, opt)
    return msg2send
  }catch(e){
    replyError(obj)
    throw(e)
  }
}
