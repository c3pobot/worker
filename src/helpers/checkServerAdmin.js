'use strict'
module.exports = async(obj)=>{
  let auth = 0, roles
  const guild = await MSG.GetGuild(obj.guild_id)
  if(guild && obj && obj.member && obj.member.user && obj.member.user.id && guild.owner_id == obj.member.user.id) auth++
  if(!auth && obj && obj.member && obj.member.user && obj.member.user.id){
    const server = (await mongo.find('discordServer', {_id: obj.guild_id}, {admin:1}))[0]
    const user = await MSG.GetGuildMember(obj.guild_id, obj.member.user.id)
    if(user && server && server.admin && server.admin.length > 0 && user.roles.length > 0){
      auth += +server.admin.filter(x=> user.roles.includes(x.id)).length
    }
  }
  return auth
}
