'use strict'
const ReportError = require('./reportError')
const DiscordFetch = require('./discordFetch')
const clientId = process.env.DISCORD_CLIENT_ID
module.exports = async()=>{
  try{
    let res = await DiscordFetch('/applications/'+clientId+'/commands', 'GET', null, {"Content-Type": "application/json", "Authorization": "Bot "+process.env.BOT_TOKEN})
    ReportError(res, 'GetGlobalCmds', {})
    return res?.body
  }catch(e){
    console.error(e);
  }
}
