'use strict'
const mongo = require('mongoclient')
const { show } = require('./helper')
const { checkGuildAdmin, getOptValue, getGuildId } = require('src/helpers')
const { GetChannel } = require('src/helpers/discordmsg')
const swgohClient = require('src/swgohClient')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'This command is only available to guild admins'}
  let auth = await checkGuildAdmin(obj, opt, null)
  if(!auth) return msg2send
  msg2send.content = 'Error getting player guild'
  let pObj = await getGuildId({dId: obj.member.user.id}, {}, opt)
  if(!pObj?.guildId) return msg2send
  msg2send.content = 'Your guild is not linked to this server'
  let guild = (await mongo.find('guilds', {_id: pObj.guildId}))[0]
  if(!guild){
    guild = {_id: pObj.guildId, guildName: pObj.guildName}
    await mongo.set('guilds', {_id: pObj.guildId}, {guildName: pObj.guildName})[0]
  }
  if(guild?.sId !== obj.guild_id) return msg2send
  msg2send.content = 'Error getting guild data'
  let gObj = await swgohClient.post('guild', {guildId: pObj.guildId, includeRecentGuildActivityInfo: true}, null)
  if(!gObj?.guild?.profile?.id) return msg2send
  let tempObj = {
    guildId: pObj.guildId,
    guildName: pObj.guildName,
    sent: 0,
    sId: guild.sId,
    chId: obj.channel_id,
    dId: obj.member.user.id,
    allyCode: pObj.allyCode,
    followup: 0,
    final: 0,
    missed: 0,
    ticketCount: 600,
    status: 1,
    skipMessageSending: false,
    sendUserMessages: true
  }

  if(guild.auto) tempObj = guild.auto
  tempObj.status = getOptValue(opt, 'status', tempObj.status)
  tempObj.chId = getOptValue(opt, 'channel', tempObj.chId)
  tempObj.ticketCount = getOptValue(opt, 'count', tempObj.ticketCount)
  tempObj.sendUserMessages = getOptValue(opt, 'messages', tempObj.sendUserMessages)
  if(tempObj.sendUserMessages){
    tempObj.skipMessageSending = false
  }else{
    tempObj.skipMessageSending = true
  }
  if(!tempObj.guildId) tempObj.guildId = pObj.guildId
  if(!tempObj.guildName) tempObj.guildName = pObj.guildName
  let tempReset = new Date(gObj.guild.nextChallengesRefresh * 1000)
  if(tempReset){
    tempObj.hours = tempReset.getHours()
    tempObj.mins = tempReset.getMinutes()
  }
  if(guild.sId) tempObj.sId = guild.sId
  msg2send.content = 'I do not have permissions to view <#'+chId+'>'
  if(chId){
    let checkPerm = await GetChannel(tempObj.chId)
    if(!checkPerm || !checkPerm.id) return msg2send
  }
  msg2send.content = 'Error updating data'
  await mongo.set('guilds', {_id: pObj.guildId}, {auto: tempObj})
  let embedMsg = await show(gObj.guild, tempObj)
  if(embedMsg){
    msg2send.content = null
    msg2send.embeds = [embedMsg]
  }
  return msg2send
}
