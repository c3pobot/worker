'use strict'
const mongo = require('mongoclient')

module.exports = async(obj = {}, opt = {})=>{
  let usr = opt.user?.data, maxAllyCodes = opt.num?.value, usrStatus = opt.status?.value
  if(!usr) return { content: 'you did not provide a user...' }

  let patreon = (await mongo.find('patreon', { _id: usr.id }, { _id: 0, TTL: 0 }))[0]
  if(!patreon) return { content: `**@${usr.nick || usr.username}** is not in the patreon list...` }

  if(maxAllyCodes >= 0) patreon.maxAllyCodes = maxAllyCodes
  if(usrStatus >= 0 ) patreon.status = usrStatus
  await mongo.set('patreon', { _id: usr.id }, patreon)
  return { content: `**@${usr.nick || usr.username}** updated with status ${patreon.status} and ${patreon.maxAllyCodes}` }
}
