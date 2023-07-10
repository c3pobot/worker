'use strict'
module.exports = async(obj, shard = {}, opt =[])=>{
  try{
    let msg2send = {content: 'You did not provide and settings to change'}, chId = shard.adminChannel, dId = shard.adminUser, option
    if(opt.find(x=>x.name == 'channel')) chId = opt.find(x=>x.name == 'channel').value
    if(opt.find(x=>x.name == 'user')) dId = opt.find(x=>x.name == 'user').value
    if(opt.find(x=>x.name == 'option')) option = opt.find(x=>x.name == 'option').value
    if(option && option == 'channel'){
      if(chId){
        await mongo.set('payoutServers', {_id: shard._id}, {adminMsg: option, adminChannel: chId})
        msg2send.content = 'admin messages have been set up to post to <#'+chId+'>'
      }else{
        msg2send.content = 'You must provide a channel'
      }
    }
    if(option && option == 'dm'){
      if(dId){
        const usrname = await HP.GetGuildMemberName(obj.guild_id, dId)
        await mongo.set('payoutServers', {_id: shard._id}, {adminMsg: option, adminUser: dId})
        msg2send.content = 'admin messages have been set up to send to @'+usrname
      }else{
        msg2send.content = 'You must provide a user'
      }
    }
    if(option && option == 'off'){
      await mongo.set('payoutServers', {_id: shard._id}, {adminMsg: option})
      msg2send.content = 'admin messages have been turned off'
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
