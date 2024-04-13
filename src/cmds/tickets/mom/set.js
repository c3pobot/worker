'use strict'
module.exports = async(obj, opt = [])=>{
  try{
    let msg2send = {content: 'This command is only available to guild admins'}, pObj, guild, dId
    const auth = await HP.CheckGuildAdmin(obj, opt, null)
    if(opt.find(x=>x.name == 'user')) dId = opt.find(x=>x.name == 'user').value
    if(auth){
      msg2send.content = 'Error getting player guild'
      pObj = await HP.GetGuildId({dId: obj.member.user.id}, {}, opt)
    }
    if(pObj && pObj.guildId){
      msg2send.content = 'Your guild is not linked to this server'
      guild = (await mongo.find('guilds', {_id: pObj.guildId}))[0]
      if(!guild){
        guild = {_id: pObj.guildId, guildName: pObj.guildName}
        await mongo.set('guilds', {_id: pObj.guildId}, {guildName: pObj.guildName})[0]
      }
    }
    if(guild && guild.sId == obj.guild_id){
      msg2send.content = 'you did not mention a user'
      if(dId){
        await mongo.set('guilds', {_id: pObj.guildId}, {'auto.momId': dId})
        msg2send.content = '<@'+dId+'> was added as the mom for guild **'+pObj.guildName+'**'
      }
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e)
    HP.ReplyError(obj)
  }
}
