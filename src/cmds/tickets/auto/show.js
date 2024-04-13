'use strict'
const { Show } = require('./helper')
module.exports = async(obj, opt = [])=>{
  try{
    let msg2send = {content: 'Error getting player guild'}, guild
    const pObj = await HP.GetGuildId({dId: obj.member.user.id}, {}, opt)
    if(pObj && pObj.guildId){
      msg2send.content = 'You do not have auto tickets set up'
      guild = (await mongo.find('guilds', {_id: pObj.guildId}))[0]
    }
    if(guild && guild.auto){
      msg2send.content = 'Error getting settings'
      const embedMsg =  await Show({profile: {name: pObj.guildName}}, guild.auto)
      if(embedMsg){
        msg2send.content = null
        msg2send.embeds = [embedMsg]
      }
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e)
    HP.ReplyError(obj)
  }
}
