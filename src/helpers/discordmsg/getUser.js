'use strict'
const DiscordFetch = require('./discordFetch')
const ReportError = require('./reportError')
module.exports = async(dId)=>{
  try{
    if(+dId > 999999){
      const res = await DiscordFetch('/users/'+dId, 'GET', null, {"Content-Type": "application/json"})
      ReportError(res, 'GetUser', {dId: dId})
      return res?.body
    }
  }catch(e){
    console.error(e)
  }
}
