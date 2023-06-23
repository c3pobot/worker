'use strict'
module.exports = async(obj = {}, opt = [])=>{
  try{
    let msg2send = {content: 'You did not provide the correct information'}, welcomeMsg, tempObj = {status: 1}
    const server = (await mongo.find('discordServer', {_id: obj.guild_id}))[0]
    if(server?.welcome) tempObj = server.welcome
    for(let i in opt){
      if(opt[i].name === 'channel') tempObj.chId = opt[i].value
      if(opt[i].name === 'message') tempObj.msg = opt[i].value
      if(opt[i].name === 'status') tempObj.status = (opt[i].value === 'enable' ? 1:0)
    }
    if(tempObj.chId && tempObj.msg){
      await mongo.set('discordServer', {_id: obj.guild_id}, {welcome: tempObj})
      msg2send.content = 'Main Greeting message was updated for <#'+tempObj.chId+'> and is **'+(tempObj.status ? 'enabled':'disabled')+'**.'
    }else{
      msg2send.content = 'You must provide a channel and message to set main greeting'
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e)
    HP.ReplyError(obj)
  }
}
