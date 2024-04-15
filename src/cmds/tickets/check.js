'use strict'
const mongo = require('mongoclient')
const { getGuildId } = require('src/helpers')
const swgohClient = require('src/swgohClient')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'Could not find guild'}
  let pObj = await getGuildId({dId: obj.member.user.id}, {}, opt)
  if(!pObj?.guildId) return msg2send
  msg2send.content = 'Error Getting Data'
  let mongoCache = 0
  let gObj = (await mongo.find('ticketCheckCache', {_id: pObj.guildId}))[0]
  if(gObj) mongoCache++;
  if(!gObj) gObj = await swgohClient.post('guild', {guildId: pObj.guildId, includeRecentGuildActivityInfo: true}, null)
  if(gObj?.guild) gObj = gObj.guild
  if(mongoCache === 0 && gObj?.profile?.id){
    gObj.updated = Date.now()
    await mongo.set('ticketCheckCache', {_id: gObj.profile.id}, gObj)
  }
  let guild = (await mongo.find('guilds', {_id: pObj.guildId}))[0]
  let ticketCount = guild?.auto?.ticketCount || 600
  if(!gObj?.member) return msg2send
  msg2send.content = 'Error calculating data'
  await mongo.set('ticketCache', {_id: gObj.profile.id}, {member: gObj.member, updated: Date.now(), TTL: new Date(gObj.nextChallengesRefresh * 1000)})
  let embedMsg = await getLowTickets(gObj, ticketCount);
  if(embedMsg){
    msg2send.content = null
    msg2send.embeds = [embedMsg]
  }
  return msg2send
}
