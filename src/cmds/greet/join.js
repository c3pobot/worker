'use strict'
module.exports = async(obj = {}, opt = [])=>{
  try{
    let msg2send = {content: 'You did not provide the correct information'}, chId, status
    const server = (await mongo.find('discordServer', {_id: obj.guild_id}))[0]
    if(server?.newMember) chId = server.newMember
    for(let i in opt){
      if(opt[i].name === 'channel') tempObj.chId = opt[i].value
      if(opt[i].name === 'status') tempObj.status = opt[i].value
    }
    if(status == 'disable'){
      if(server && server.newMember) await mongo.unset('discordServer', {_id: obj.guild_id}, {newMember: server.newMember})
      msg2send.content = 'You have disabled new member join messages'
    }else{
      msg2send.content = 'You must specify a channel for the join messages'
      if(chId){
        await mongo.set('discordServer', {_id: obj.guild_id}, {newMember: chId})
        msg2send.content = '<#'+chId+'> has been set up as the join/landing channel.\n'
        //msg2send.content += 'Ensure you have enabled to "send a random welcome message when someone joins this server" or else the bot will not see when someone joins'
      }
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e)
    HP.ReplyError(obj)
  }
}
