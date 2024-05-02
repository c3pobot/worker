'use strict'
module.exports = async(obj = {})=>{
  if(!obj.member?.user?.id) return
  if(obj.guild?.owner_id == obj.member.user.id) return true
  let server = (await mongo.find('discordServer', { _id: obj.guild_id }, { admin:1 }))[0]
  if(!server?.admin || server?.admin?.length == 0) return
  let roles = obj.members?.roles
  if(!roles || roles?.length == 0) return
  if(server.admin.filter(x=>roles.includes(x.id)).length > 0) return true
}
