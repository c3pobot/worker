'use strict'
const DiscordFetch = require('./discordFetch')
const ReportError = require('./reportError')
module.exports = async(chId)=>{
  try{
    if(+chId > 999999){
      const obj = await DiscordFetch('/channels/'+chId, 'GET', null, {"Content-Type": "application/json"})
      ReportError(obj, 'GetChannel', {chId: chId})
      return obj?.body
    }
  }catch(e){
    console.error(e)
  }
}
