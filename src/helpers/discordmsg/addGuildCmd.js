'use strict'
const clientId = process.env.DISCORD_CLIENT_ID
const DiscordFetch = require('./discordFetch')
const ReportError = require('./reportError')
module.exports = async(sId, cmd, method = 'PUT')=>{
  try{
    if(sId > 999999){
      const res = await DiscordFetch('/applications/'+clientId+'/guilds/'+sId+'/commands', method, JSON.stringify(cmd), {"Content-Type": "application/json"})
      ReportError(res, 'AddGuildCmd', {sId: sId})
      return res?.body
    }
  }catch(e){
    console.error(e)
  }
}
