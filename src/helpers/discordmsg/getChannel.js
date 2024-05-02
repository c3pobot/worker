'use strict'
const discordFetch = require('./discordFetch')
module.exports = async(chId)=>{
  if(!chId) return
  let obj = await discordFetch('/channels/'+chId, 'GET', null, {"Content-Type": "application/json"})
  return obj?.body
}
