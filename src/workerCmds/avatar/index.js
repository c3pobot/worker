'use strict'
const { GetOptValue, getDiscordAvatarUrl, ReplyError, ReplyMsg } = require('helpers')
const { GetGuild, GetGuildMember } = require('discordapiclient')
module.exports = async(obj = {})=>{
  try{
    let msgName, footerText, msg2Send = {content: 'Error getting avatar'}, username = (obj.member.nick ? obj.member.nick:obj.member.user.username), iconId, iconName, iconType, embedColor = 15844367
    let sId = await GetOptValue(obj.data?.options, 'server')
    if(sId?.toString()?.toLowerCase() === 'this') sId = obj.guild_id
    let dId = await GetOptValue(obj.data?.options, 'user')
    if(!sId && !dId) dId = obj.member?.user?.id
    if(sId){
      const guild = await GetGuild(sId)
      if(guild?.id && guild?.icon){
        iconId = guild.id
        iconName = guild.icon
        iconType = 'icons'
        msgName = guild.name
      }
    }else{
      if(dId){
        const member = await GetGuildMember(obj.guild_id, dId)
        if(member?.user){
          iconId = dId
          iconName = member.avatar
          if(!iconName) iconName = member.user.avatar
          iconType = 'avatars'
          msgName = member.nick
          if(member.user.accent_color) embedColor = member.user.accent_color
          if(!msgName) msgName = member.user.global_name
          if(!msgName) msgName = member.user.username
          if(member.user.bot && msgName) msgName += ' (bot)'
        }
      }
    }
    const avatarURL = await getDiscordAvatarUrl(iconId, iconName, iconType)
    if(avatarURL){
      const embedMsg = {
        author: {
          name: msgName,
          icon_url: avatarURL
        },
        color: embedColor,
        image: {
          url: avatarURL
        },
        footer: {
          text: 'ID: '+iconId
        },
        timestamp: new Date()
      }
      msg2Send.content = null
      msg2Send.embeds = [embedMsg]
    }
    ReplyMsg(obj, msg2Send)
  }catch(e){
    console.error(e)
    ReplyError(e)
  }
}
