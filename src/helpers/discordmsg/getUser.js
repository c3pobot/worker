'use strict'
const discordFetch = require('./discordFetch')
module.exports = async(dId)=>{
  if(!dId) return
  let res = await discordFetch('/users/'+dId, 'GET', null, {"Content-Type": "application/json"})
  return res?.body
}
