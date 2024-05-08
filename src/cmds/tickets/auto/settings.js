'use strict'
const mongo = require('mongoclient')
const show = require('./show')
const { checkGuildAdmin, checkBotPerms, getGuildId } = require('src/helpers')
const swgohClient = require('src/swgohClient')

module.exports = async(obj = {}, opt = {})=>{
  let auth = await checkGuildAdmin(obj, opt)
  if(!auth) return { content: 'This command is only available to guild admins' }

  let pObj = await getGuildId({dId: obj.member.user.id}, {}, opt)
  if(!pObj?.guildId) return { content: 'Error getting player guild' }

  let guild = (await mongo.find('guilds', {_id: pObj.guildId}))[0]
  if(!guild){
    guild = { _id: pObj.guildId, guildName: pObj.guildName }
    await mongo.set('guilds', { _id: pObj.guildId }, { guildName: pObj.guildName })[0]
  }
  if(guild?.sId !== obj.guild_id) return { content: 'Your guild is not linked to this server' }

  let gObj = await swgohClient.post('guild', {guildId: pObj.guildId, includeRecentGuildActivityInfo: true}, null)
  if(!gObj?.guild?.profile?.id) return { content: 'Error getting guild data' }

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
  if(opt.status?.value >= 0) tempObj.status = opt.status?.value
  tempObj.chId = opt.channel?.value || tempObj.chId
  tempObj.ticketCount = opt.count?.value || tempObj.ticketCount
  tempObj.sendUserMessages = opt.messages?.value || tempObj.sendUserMessages
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
  if(opt.channel?.data){
    let channelPerm = checkBotPerms('SEND_MESSAGES', opt.channel?.botPerms)
    if(!channelPerm) return { content: `I do not have permissions to send messages to <#${opt.channel.value}>...`}
  }
  await mongo.set('guilds', { _id: pObj.guildId }, { auto: tempObj })
  return await show(obj, opt)
}
