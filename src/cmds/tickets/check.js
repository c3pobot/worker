'use strict'
const mongo = require('mongoclient')
const { getGuildId, getLowTickets } = require('src/helpers')
const swgohClient = require('src/swgohClient')

module.exports = async(obj = {}, opt = {})=>{
  let pObj = await getGuildId({dId: obj.member.user.id}, {}, opt)
  if(!pObj?.guildId) return { content: 'Error getting player guild' }

  let mongoCache = 0
  let gObj = (await mongo.find('ticketCheckCache', {_id: pObj.guildId}))[0]
  if(gObj) mongoCache++;
  if(!gObj) gObj = await swgohClient.post('guild', {guildId: pObj.guildId, includeRecentGuildActivityInfo: true}, null)
  if(gObj?.guild) gObj = gObj.guild
  if(mongoCache === 0 && gObj?.profile?.id){
    gObj.updated = Date.now()
    await mongo.set('ticketCheckCache', {_id: gObj.profile.id}, gObj)
  }
  if(!gObj?.member) return { content : 'Error getting guild data' }

  let guild = (await mongo.find('guilds', {_id: pObj.guildId}))[0]
  let ticketCount = guild?.auto?.ticketCount || 600
  await mongo.set('ticketCache', {_id: gObj.profile.id}, {member: gObj.member, updated: Date.now(), TTL: new Date(gObj.nextChallengesRefresh * 1000)})
  let embedMsg = await getLowTickets(gObj, ticketCount);
  if(embedMsg) return { content: null, embeds: [embedMsg] }
  return { content: 'Error calculating data' }
}
