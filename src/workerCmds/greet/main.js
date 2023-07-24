'use strict'
const { mongo, GetOptValue, ReplyMsg } = require('helpers')
module.exports = async(obj = {}, opt = [])=>{
  try{
    let msg2send = {content: 'You did not provide the correct information'}, welcomeMsg, tempObj = {status: 1}
    const server = (await mongo.find('discordServer', {_id: obj.guild_id}))[0]
    if(server?.welcome) tempObj = server.welcome
    tempObj.chId = GetOptValue(opt, 'chId', tempObj.chId)
    tempObj.msg = GetOptValue(opt, 'message', tempObj.msg)
    let status = GetOptValue(opt, 'status')
    if(status) tempObj.status = (status === 'enable' ? 1:0)
    if(tempObj.chId && tempObj.msg){
      await mongo.set('discordServer', {_id: obj.guild_id}, {welcome: tempObj})
      msg2send.content = 'Main Greeting message was updated for <#'+tempObj.chId+'> and is **'+(tempObj.status ? 'enabled':'disabled')+'**.'
    }else{
      msg2send.content = 'You must provide a channel and message to set main greeting'
    }
    await ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
