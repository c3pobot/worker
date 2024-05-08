'use strict'
const mongo = require('mongoclient')
const swgohClient = require('src/swgohClient')
const { checkGuildAdmin, getGuildId, sendMessages, getLowTickets } = require('src/helpers')

module.exports = async(obj = {}, opt = {})=>{
  let auth = await checkGuildAdmin(obj, opt, null)
  if(!auth) return { content: 'This command is only available to guild admins' }

  let pObj = await getGuildId({dId: obj.member.user.id}, {}, opt)
  if(!pObj?.guildId) return { content: 'Error getting player guild' }

  let guild = (await mongo.find('guilds', {_id: pObj.guildId}, {auto: 1}))[0]
  let ticketCount = guild?.auto?.ticketCount || 600, mongoCache = 0
  let gObj = (await mongo.find('ticketCheckCache', { _id: pObj.guildId }))[0]
  if(gObj) mongoCache++;
  if(!gObj) gObj = await swgohClient.post('guild', { guildId: pObj.guildId, includeRecentGuildActivityInfo: true }, null)
  if(gObj?.guild) gObj = gObj.guild
  if(mongoCache === 0 && gObj?.profile?.id){
    gObj.updated = Date.now()
    await mongo.set('ticketCheckCache', { _id: gObj.profile.id }, gObj)
  }
  if(!gObj?.member) return { content : 'Error getting guild data' }

  let timeNow = Date.now(), resetTime = gObj.nextChallengesRefresh * 1000
  if(gObj?.profile?.id) await mongo.set('ticketCache', { _id: gObj.profile.id }, { member: gObj.member, updated: Date.now(), TTL: new Date(gObj.nextChallengesRefresh * 1000) })

  if(resetTime < timeNow || (resetTime - timeNow) > 7200 * 1000){
    let embedMsg = await getLowTickets(gObj, ticketCount)
    return { content: 'You are only allowed to send reminders thru the bot 2 hours before guild reset', embeds: [embedMsg] }
  }
  if(guild?.auto?.sent && (+timeNow - +guild.auto.sent) < 600000){
    let msg2send = { content: 'You are only allowed to send reminders thru the bot every 10 minutes' }
    let embedMsg = await getLowTickets(gObj, ticketCount)
    if(embedMsg) msg2send.embeds = [embedMsg]
    return msg2send

  }else{
    await sendMessages({...guild.auto, sId: obj.guild_id, chId: obj.channel_id }, gObj)
    await mongo.set('guilds', { _id: gObj.profile.id }, { 'auto.sent': Date.now() })
    return
  }
}
