'use strict'
const ReplyMsg = require('./replyMsg')
const { GetGuild, GetGuildMember } = require('discordapiclient')
module.exports =  async(obj = {})=>{
  try{
    let guildOwner, username
    const guildInfo = await GetGuild(obj.guild_id)

    if(guildInfo && guildInfo.owner_id) guildOwner = await GetGuildMember(obj.guild_id, guildInfo.owner_id)

    if(guildOwner && guildOwner.user) username = (guildOwner.nick ? guildOwner.nick:guildOwner.user.username)
    let msg2send = '>>> **Server Admin Error**\nYou are not authorized to run Admin commands.\n'
    msg2send += 'You must be the Discord Server Owner or have a role that was added with the `/admin role add` command\n'
    msg2send += 'The Discord Server owner is : `@'+(username ? username:'UNKNOWN')+'`\n'
    msg2send += 'You can use the `/admin show` command to see which @roles have been added'
    ReplyMsg(obj, {content: msg2send})
  }catch(e){
    console.error(e)
  }
}
