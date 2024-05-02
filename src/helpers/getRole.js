'use strict'
const { getRoles } = require('./discordmsg')
module.exports = async(sId, roleId)=>{
  if(!sId || !roleId) return
  let roles = await getRoles(sId)
  return roles?.find(x=>x?.id == roleId)
}
