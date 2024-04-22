'use strict'

const { GetGuild, GetGuildMember } = require('./discordmsg')
module.exports = async(obj = {})=>{
  let auth = 0, roles
  let guild = await GetGuild(obj.guild_id)
  if(!guild) return

  if(obj.member?.user?.id && guild.owner_id == obj.member.user.id) auth++
  if(!auth && obj.member?.user?.id){
    let server = (await mongo.find('discordServer', {_id: obj.guild_id}, {admin:1}))[0]
    let user = await GetGuildMember(obj.guild_id, obj.member.user.id)
    if(server?.admin?.length > 0 && user?.roles?.length > 0){
      auth += +server.admin.filter(x=> user.roles.includes(x.id)).length
    }
  }
  if(auth > 0) return true
}
