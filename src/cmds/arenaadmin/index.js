'use strict'

const Cmds = {}
Cmds.add = require('./add')
Cmds.edit = require('./edit')
Cmds.remove = require('./remove')
Cmds.show = require('./show')
const { checkBotOwner, getOptValue, replyError } = require('src/helpers')


module.exports = async(obj = {})=>{
  try{
    let msg2send = {content: 'This command is only available to the bot owner'}
    let auth = checkBotOwner(obj)
    if(!auth) return msg2send
    let tempCmd = getOptValue(obj.data?.options, 'option')
    msg2send = {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')}
    if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, obj.data.options)
    return msg2send
  }catch(e){
    replyError(obj)
    throw(e)
  }
}
