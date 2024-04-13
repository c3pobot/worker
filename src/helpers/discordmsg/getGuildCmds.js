'use strict'
const DiscordFetch = require('./discordFetch')
const ReportError = require('./reportError')
const clientId = process.env.DISCORD_CLIENT_ID
module.exports = async(sId)=>{
  try{
    if(+sId > 99999){
      const res = await DiscordFetch('/applications/'+clientId+'/guilds/'+sId+'/commands', 'GET', null, {"Content-Type": "application/json", "Authorization": "Bot "+process.env.BOT_TOKEN})
      ReportError(res, 'GetGuildCmds', {sId: sId})
      return res?.body
    }
  }catch(e){
    console.error(e);
  }
}
