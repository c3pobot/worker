'use strict'
const ReportError = require('./reportError')
const DiscordFetch = require('./discordFetch')
module.exports = async(msg = {})=>{
  try{
    if(+msg.msgId > 999999 && +msg.chId > 999999 && msg.perms.filter(x=>x == 'MANAGE_MESSAGES')?.length > 0){
      const res = await DiscordFetch('/channels/'+msg.chId+'/messages/'+msg.msgId, 'DELETE', {"Content-Type": "application/json"})
      ReportError(res, 'DeleteMsg', msg)
      return res?.body
    }
  }catch(e){
    console.error(e)
  }
}
