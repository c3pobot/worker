'use strict'
const Cmds = {}
Cmds.channel = require('./channel')
Cmds.guild = require('./guild')
Cmds.user = require('./user')

const { replyError, checkBotOwner } = require('src/helpers')
module.exports = async(obj = {})=>{
  try{
    let auth = checkBotOwner(obj)
    if(!auth) return { content: 'This command is only available to the bot owner' }
    let opt = obj.data?.options || {}, tempCmd = obj.data?.options?.option?.value

    let msg2send = { content: 'command not recongnized' }
    if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, opt)
    return msg2send
  }catch(e){
    replyError(obj)
    throw(e)
  }
}
