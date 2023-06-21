'use strict'
module.exports = async(obj, opt = [])=>{
  try{
    let msg2send = {content: 'Error getting info'}, ownerName
    const server = await MSG.GetGuild(obj.guild_id)
    if(server){
      const guild = (await mongo.find('discordServer', {_id: obj.guild_id}))[0]
      const owner = await MSG.GetGuildMember(obj.guild_id, server.owner_id)
      if(owner){
        ownerName = owner.user.username
        if(owner.nick) ownerName = owner.nick
      }
      msg2send.content = null
      const embedMsg = {
        color: 15844367,
        title: server.name+' info',
        timestamp: new Date(),
        fields: [{
          name: 'Server Owner : ',
          value: '```\n@'+(ownerName ? ownerName:'UNKNOWN')+'\n```\n'
        }]
      }
      if(guild){
        if(guild.admin && guild.admin.length > 0){
          const tempAdmin = {
            name: 'Bot Admin Role(s)',
            value: '```\n'
          }
          for(let i in guild.admin){
            if(server.roles.find(x=>x.id == guild.admin[i].id)) tempAdmin.value += '@'+server.roles.find(x=>x.id == guild.admin[i].id).name+'\n'
          }
          tempAdmin.value += '```'
          embedMsg.fields.push(tempAdmin)
        }
        if(guild.guilds && guild.guilds.length > 0){
          const tempGuild = {
            name: 'Linked Guild(s)',
            value: '```\n'
          }
          for(let i in guild.guilds) tempGuild.value += guild.guilds[i].guildName+'\n'
          tempGuild.value += '```'
          embedMsg.fields.push(tempGuild)
        }
        if(guild.unitAlias && guild.unitAlias.length > 0){
          embedMsg.fields.push({name: 'Alias Count', value: '```\n'+guild.unitAlias.length+'\n```'})
        }
      }
      msg2send.embeds = [embedMsg]
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
