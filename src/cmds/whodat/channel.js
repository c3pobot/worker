'use strict'
const { getChannel, getGuild, getGuildMember } = require('src/helpers/discordmsg')
const { dataList } = require('src/helpers/dataList')
const { getId } = require('src/helpers/botRequest')
module.exports = async(obj = {}, opt = {})=>{
  if(!opt.id?.value) return { content: 'channel not provided' }

  let channel = await getChannel(opt.id.value)
  if(!channel?.guild_id) return { content: 'error finding that channel' }

  let guild = await getGuild(channel?.guild_id)
  if(!guild?.id) return { content: 'error finding channel server' }

  let usr
  if(guild?.owner_id) usr = await getGuildMember(guild.id, guild.owner_id)
  let embedMsg = { color: 15844367, description: 'chId '+opt.id.value+' info for C3PO\n```\n' }
  embedMsg.description += 'Guild Name   : '+(guild ? guild.name:'UNKONWN')+'\n'
  embedMsg.description += 'Guild ID     : '+(channel.guild_id ? channel.guild_id:'UNKNOWN')+'\n'
  embedMsg.description += `Bot Client   : ${getId(guild.id)}/${dataList?.numBotShards}\n`
  embedMsg.description += 'Member Count : '+(guild ? guild.approximate_member_count:'UNKNOWN')+'\n'
  if(usr){
    if(usr.nick){
      embedMsg.description += 'Owner        : @'+usr.nick+'\n'
    }else{
      if(usr.user){
        embedMsg.description += 'Owner        : @'+(usr.user.username ? usr.user.username:'UNKNOWN')+'\n'
      }else{
        embedMsg.description += 'Owner        : @UNKNOWN\n'
      }
    }
  }
  embedMsg.description += 'Owner Tag    : @'+(usr && usr.user ? usr.user.username+'#'+usr.user.discriminator:'UNKNOWN')+'\n'
  embedMsg.description += 'Channel Name : '+channel.name+'\n'
  embedMsg.description += 'Channel ID   : '+channel.id+'\n'
  embedMsg.description += 'catId        : '+(channel.parent_id ? channel.parent_id:'n/a')+'\n'
  embedMsg.description += '```'
  return { content: null, embeds: [embedMsg] }
}
