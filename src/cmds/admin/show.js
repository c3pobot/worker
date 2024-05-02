'use strict'
const mongo = require('mongoclient')
const { getGuildMember } = require('src/helpers/discordmsg')

module.exports = async(obj = {}, opt = {})=>{
  if(!obj.guild?.owner_name && obj.guild?.owner_id){
    let owner = await getGuildMember(obj.guild_id, obj.guild.owner_id)
    if(owner) obj.guild.owner_name = owner?.nickname || owner?.user?.username
  }
  let guild = (await mongo.find('discordServer', {_id: obj.guild_id}))[0]

  let embedMsg = {
    color: 15844367,
    title: server.name+' info',
    timestamp: new Date(),
    fields: [{
      name: 'Server Owner : ',
      value: '```\n@'+( `@${obj.guild?.owner_name}` || obj.guild?.owner_id)+'\n```\n'
    }]
  }
  if(guild){
    if(guild.admin?.length > 0){
      let tempAdmin = {
        name: 'Bot Admin Role(s)',
        value: '```\n'
      }
      for(let i in guild.admin){
        if(server.roles.find(x=>x.id == guild.admin[i].id)) tempAdmin.value += '@'+server.roles.find(x=>x.id == guild.admin[i].id).name+'\n'
      }
      tempAdmin.value += '```'
      embedMsg.fields.push(tempAdmin)
    }
    if(guild.guilds?.length > 0){
      const tempGuild = {
        name: 'Linked Guild(s)',
        value: '```\n'
      }
      for(let i in guild.guilds) tempGuild.value += guild.guilds[i].guildName+'\n'
      tempGuild.value += '```'
      embedMsg.fields.push(tempGuild)
    }
  }
  return { content: null, embed: [embedMsg] }
}
