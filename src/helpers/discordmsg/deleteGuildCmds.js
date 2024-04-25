'use strict'
const clientId = process.env.DISCORD_CLIENT_ID
const discordFetch = require('./discordFetch')
module.exports = async(sId, commandId)=>{
  try{
    if(!sId || !commandId) return
    let res = await discordFetch(`/applications/${clientId}/guilds/${sId}/commands/${commandId}`, 'DELETE')
    if(res?.status === 204) return true
  }catch(e){
    log.error('deleteGuildCmd')
    log.error(e)
  }
}
