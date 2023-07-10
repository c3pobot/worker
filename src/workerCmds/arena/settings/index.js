'use strict'
module.exports = async(obj, patreon, opt)=>{
  try{
    let msg2send = {content: 'correct info not provided'}, chId, channelPerm = 1
    if(opt && opt.find(x=>x.name == 'channel')) chId = opt.find(x=>x.name == 'channel').value
    if(chId){
      const checkPerm = await MSG.GetChannel(chId)
      if(!checkPerm || !checkPerm.id) channelPerm = 0
    }
    if(channelPerm){
      if(chId){
        await mongo.set('patreon', {_id: patreon._id}, {chId: chId, sId: obj.guild_id})
        msg2send.content = '<#'+chId+'> was set as log channel for you users to use'
      }else{
        await mongo.unset('patreon', {_id: patreon._id}, {chId: patreon.chId, sId: patreon.sId})
        msg2send.content = 'You have removed the log channel for your users'
      }
    }else{
      msg2send.content = 'Sorry i do not have permissions to view <#'+chId+'>. You need to fix this before you can use that channel'
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
