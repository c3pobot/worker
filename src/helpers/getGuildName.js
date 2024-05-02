'use strict'
const mongo = require('mongoclient')
const swgohClient = require('src/swgohClient')
const cache = require('./cache')

module.exports = async(id)=>{
  if(!id) return
  let gObj = (mongo.find('guildIdCache', { guildId: id }))[0]
  if(gObj?.guildName) return gObj.guildName
  let guild = await swgohClient.post('queryGuild', { guildId: id }, null)
  if(guild?.profile?.name) return guild.profile.name
}
