'use strict'
const discordFetch = require('./discordFetch')

module.exports = async(sId)=>{
  if(!sId) return
  let res = await discordFetch('/guilds/'+sId+'/roles', 'GET', null, { "Content-Type": "application/json" })
  return res?.body
}
