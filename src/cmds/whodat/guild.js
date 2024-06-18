'use strict'
const { getChannel, getGuild, getGuildMember } = require('src/helpers/discordmsg')
const { getId, getNumShards } = require('src/helpers/botRequest/botInfo')

module.exports = async(obj = {}, opt = {})=>{
  if(!opt.id?.value) return { content: 'you did not provide a server' }

  let guild = await getGuild(opt.id.value)
  if(!guild?.id) return { content: 'error finding that server' }

  let usr
  if(guild?.owner_id) usr = await getGuildMember(guild.id, guild.owner_id)
  let embedMsg = { color: 15844367, description: 'sId '+opt.id.value+' info for C3PO\n```\n' }
  embedMsg.description += 'Guild Name   : '+guild.name+'\n'
  embedMsg.description += 'Guild ID     : '+guild.id+'\n'
  embedMsg.description += `Bot Client   : ${getId(guild.id)}/${getNumShards()}\n`
  embedMsg.description += 'Member Count : '+guild.approximate_member_count+'\n'
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
  embedMsg.description += '```'
  return { content: null, embeds: [embedMsg] }
}
