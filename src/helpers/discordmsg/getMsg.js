'use strict'
const DiscordFetch = require('./discordFetch')
const ReportError = require('./reportError')
module.exports = async(chId, msgId)=>{
  try{
    if(+chId > 999999 && +msgId > 999999){
      const res = await MSG.DiscordFetch('/channels/'+chId+'/messages/'+msgId, 'GET', null, {"Content-Type": "application/json"})
      ReportError(obj, 'GetMsg', {chId: chId, msgId: msgId})
      if(res?.body?.id === msgId) return res.body;
    }
  }catch(e){
    console.error(e)
  }
}
