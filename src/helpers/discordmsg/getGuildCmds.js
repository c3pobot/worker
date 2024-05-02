'use strict'
const discordFetch = require('./discordFetch')
const clientId = process.env.DISCORD_CLIENT_ID

module.exports = async(sId)=>{
  if(!sId) return
  const res = await discordFetch('/applications/'+clientId+'/guilds/'+sId+'/commands', 'GET', null, {"Content-Type": "application/json", "Authorization": "Bot "+process.env.BOT_TOKEN})
  return res?.body
}
