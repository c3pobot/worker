'use strict'
const DiscordFetch = require('./discordFetch')
const ReportError = require('./reportError')
module.exports = async(sId, dId)=>{
  try{
    if(+sId > 999999 && +dId > 999999){
      const res = await DiscordFetch('/guilds/'+sId+'/members/'+dId, 'GET', null, {"Content-Type": "application/json"})
      ReportError(res, 'GetGuildMember', {sId: sId, dId: dId})
      return res?.body
    }
  }catch(e){
    console.error(e)
  }
}
