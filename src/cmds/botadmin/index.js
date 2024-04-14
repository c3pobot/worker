'use strict'
const Cmds = {}
Cmds.syncguild = require('./syncguild')
//Cmds.updatedata = require('./updatedata')
Cmds.updateweather = require('./updateweather')
const { checkBotOwner, replyError } = require('src/helpers')

module.exports = async(obj = {})=>{
  try{
    let auth = checkBotOwner(obj), msg2send = {content: 'This command is only available to the bot owner'}
    if(!auth) return msg2send
    let tempCmd, opt
    if(obj?.data?.options){
      for(let i in obj.data.options){
        if(Cmds[obj.data.options[i].name]){
          tempCmd = obj.data.options[i].name
          opt = obj.data.options[i].options
          break;
        }
      }
    }
    msg2send = {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')}
    if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, opt)
    return msg2send
  }catch(e){
    replyError(obj)
    throw(e)
  }
}
