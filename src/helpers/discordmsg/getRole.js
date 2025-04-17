'use strict'
module.exports = async(sId, roleId)=>{
  if(!sId || !roleId) return
  let res = await discordFetch(`/guilds/${sId}/roles/${roleId}`, 'GET', null, { "Content-Type": "application/json" })
  return res?.body
}
