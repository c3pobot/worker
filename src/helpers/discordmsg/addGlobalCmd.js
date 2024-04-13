'use strict'
const clientId = process.env.DISCORD_CLIENT_ID
const DiscordFetch = require('./discordFetch')
const ReportError = require('./reportError')
module.exports = async(cmd, method = 'PUT')=>{
  try{
    let res = await DiscordFetch('/applications/'+clientId+'/commands', method, JSON.stringify(cmd), {"Content-Type": "application/json"})
    ReportError(res, 'AddGlobalCmd', {})
    return res?.body
  }catch(e){
    console.error(e)
  }
}
