'use strict'
const { GetRoles } = require('./discordmsg')
module.exports = async(sId, roleId)=>{
  if(!sId || !roleId) return
  let roles = await GetRoles(sId)
  if(roles?.length > 0 && roles.find(x=>x.id == roleId)) return roles.find(x=>x.id == roleId)
}
