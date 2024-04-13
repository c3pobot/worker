'use strict'
module.exports = async(obj, opt = [])=>{
  try{
    let msg2send = {content: 'This command is only available to guild admins'}, pObj, guild, player, allyCode
    const auth = await HP.CheckGuildAdmin(obj, opt, null)
    if(opt.find(x=>x.name == 'allycode')) allyCode = +opt.find(x=>x.name == 'allycode').value.trim().replace(/-/g,'')
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
      msg2send.content = '**'+allyCode+'** is not a valid allyCode'
      player = await Client.post('queryPlayer', {allyCode: allyCode.toString()}, null)
    }
    if(player && player.name){
      msg2send.content = '**'+allyCode+'** is not in the mom watch list'
      if(guild.auto && guild.auto.momWatch && guild.auto.momWatch.filter(x=>x.allyCode == +allyCode).length > 0){
        await mongo.pull('guilds', {_id: pObj.guildId}, {'auto.momWatch': {allyCode: +allyCode}})
        msg2send.content = '**'+player.name+'** with allyCode **'+allyCode+'** was removed from the mom watch list for guild **'+pObj.guildName+'**'
      }
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e)
    HP.ReplyError(obj)
  }
}
