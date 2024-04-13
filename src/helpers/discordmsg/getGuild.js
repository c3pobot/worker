'use strict'
const DiscordFetch = require('./discordFetch')
const ReportError = require('./reportError')
module.exports = async(sId)=>{
  try{
    if(+sId > 999999){
      const res = await DiscordFetch('/guilds/'+sId+'?with_counts=true', 'GET', null, {"Content-Type": "application/json"})
      ReportError(res, 'GetGuild', {sId: sId})
      return res?.body
    }
  }catch(e){
    console.error(e)
  }
}
