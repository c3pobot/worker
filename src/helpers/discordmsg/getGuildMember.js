'use strict'
const discordFetch = require('./discordFetch')
module.exports = async(sId, dId)=>{
  if(!sId || !dId) return
  let res = await discordFetch('/guilds/'+sId+'/members/'+dId, 'GET', null, {"Content-Type": "application/json"})
  return res?.body
}
