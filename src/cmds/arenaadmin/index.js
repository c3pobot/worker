'use strict'

const Cmds = {}
Cmds.add = require('./add')
Cmds.edit = require('./edit')
Cmds.remove = require('./remove')
Cmds.show = require('./show')
const { checkBotOwner, getOptValue, replyMsg, replyError } = require('src/helpers')


module.exports = async(obj = {})=>{
  try{
    let msg2send = {content: 'This command is only available to the bot owner'}
    let auth = checkBotOwner(obj)
    if(!auth){
      await replyMsg(obj, msg2send)
      return
    }
    let tempCmd = getOptValue(obj.data?.options, 'option')
    msg2send = {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')}
    if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, obj.data.options)
    if(msg2send) await replyMsg(obj, msg2send)
  }catch(e){
    replyError(obj)
    throw(e)
  }
}
