'use strict'
module.exports = async(obj, opt = [])=>{
  try{
    let msg2send = {content: 'Error finding your guild'}, guild, usr
    const pObj = await HP.GetGuildId({dId: obj.member.user.id}, {}, opt)
    if(pObj && pObj.guildId){
      msg2send.content = 'Your guild is not linked to this server'
      guild = (await mongo.find('guilds', {_id: pObj.guildId}))[0]
      if(!guild){
        guild = {_id: pObj.guildId, guildName: pObj.guildName}
        await mongo.set('guilds', {_id: pObj.guildId}, {guildName: pObj.guildName})[0]
      }
    }
    if(guild && guild.sId == obj.guild_id){
      msg2send.content = 'You do not have mom set up for guild **'+pObj.guildName+'**'
      if(guild.auto){
        if(guild.auto.momId) usr = await MSG.GetGuildMember(obj.guild_id, guild.auto.momId)
        const embedMsg = {
          color: 15844367,
          title: pObj.guildName+' mom watch settings'
        }
        if(guild.auto.momId || (guild.auto.momWatch && guild.auto.momWatch.length > 0)){
          embedMsg.description = ''
          if(guild.auto.momId) embedMsg.description += 'Mom : '+(usr ? '@'+(usr.nick ? usr.nick:usr.user.username):'<@'+guild.auto.momId+'>')+'\n'
          if(guild.auto.momWatch && guild.auto.momWatch.length > 0){
            embedMsg.description += 'AllyCode - Name\n```\n'
            for(let i in guild.auto.momWatch) embedMsg.description += guild.auto.momWatch[i].allyCode+' - '+guild.auto.momWatch[i].name+'\n'
            embedMsg.description += '```'
          }
        }
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
