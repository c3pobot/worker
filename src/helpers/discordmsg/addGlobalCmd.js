'use strict'
const clientId = process.env.DISCORD_CLIENT_ID
const DiscordFetch = require('./discordFetch')

module.exports = async(cmd = [], method = 'PUT')=>{
  if(!cmd || cmd?.length == 0) return
  let res = await DiscordFetch('/applications/'+clientId+'/commands', method, JSON.stringify(cmd), {"Content-Type": "application/json"})
  return res?.body
}
