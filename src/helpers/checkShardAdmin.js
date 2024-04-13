'use strict'
const BOT_OWNER_ID = process.env.BOT_OWNER_ID
const { GetGuild } = require('./discordmsg')
module.exports = async(obj, shard)=>{
  let auth = 0
  const guild = await GetGuild(obj.guild_id)
  if(obj && obj.member && obj.member.user && obj.member.user.id && BOT_OWNER_ID == obj.member.user.id) auth++
  if(guild && obj && obj.member && obj.member.user && obj.member.user.id && guild.owner_id == obj.member.user.id) auth++
  if(shard && shard.patreonId && obj.member && obj.member.user && obj.member.user.id && shard.patreonId == obj.member.user.id) auth++
  if(!auth && shard.admin && obj.member && obj.member.roles && obj.member.roles.length > 0){
    for(let i in shard.admin){
      if(obj.member.roles.filter(x=>x == i).length > 0){
        auth++;
        break;
      }
    }
  }
  if(auth > 0) return true
}
