'use strict'
const clientId = process.env.DISCORD_CLIENT_ID
const discordFetch = require('./discordFetch')
module.exports = async(sId, cmd, method = 'PUT')=>{
  if(!cmd || !sId) return
  let res = await discordFetch('/applications/'+clientId+'/guilds/'+sId+'/commands', method, JSON.stringify(cmd), {"Content-Type": "application/json"})
  return res?.body
}
