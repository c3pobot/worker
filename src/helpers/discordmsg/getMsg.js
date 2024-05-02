'use strict'
const discordFetch = require('./discordFetch')
module.exports = async(chId, msgId)=>{
  if(!chId || !msgId) return
  let res = await discordFetch('/channels/'+chId+'/messages/'+msgId, 'GET', null, { "Content-Type": "application/json" })
  if(res?.body?.id === msgId) return res.body;
}
