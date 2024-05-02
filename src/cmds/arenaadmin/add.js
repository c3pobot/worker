'use strict'
const mongo = require('mongoclient')

module.exports = async(obj = {}, opt = {})=>{
  let usr = opt.user?.data, maxAllyCodes = opt.num?.value || 100
  if(!usr) return { content: 'You did not provide the correct information' }

  let exists = (await mongo.find('patreon', { _id: usr.id }))[0]
  if(exists) return { content: `**@${usr.nick || usr.username}** was already added...`}

  await mongo.set('patreon', { _id: usr.id }, { maxAllyCodes: maxAllyCodes, status: 1, users: [], guilds: [] })
  return { content: `**@${usr.nick || usr.username}** added...`}
}
