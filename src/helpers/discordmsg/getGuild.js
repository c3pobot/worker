'use strict'
const discordFetch = require('./discordFetch')
module.exports = async(sId)=>{
  if(!sId) return
  let res = await discordFetch('/guilds/'+sId+'?with_counts=true', 'GET', null, { "Content-Type": "application/json" })
  return res?.body
}
