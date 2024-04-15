'use strict'
const mongo = require('mongoclient')
const { GetGuildMember } = require('src/helpers/discordmsg')
const { getGuildId, getOptValue } = require('src/helpers')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'Error finding your guild'}
  let pObj = await getGuildId({dId: obj.member.user.id}, {}, opt)
  if(!pObj?.guildId) return msg2send
  msg2send.content = 'Your guild is not linked to this server'
  let guild = (await mongo.find('guilds', {_id: pObj.guildId}))[0]
  if(!guild){
    guild = {_id: pObj.guildId, guildName: pObj.guildName}
    await mongo.set('guilds', {_id: pObj.guildId}, {guildName: pObj.guildName})[0]
  }
  if(guild?.sId !== obj.guild_id) return msg2send
  if(!guild?.auto?.momId) return { content: 'You do not have mom set up for guild **'+pObj.guildName+'**' }
  let usr = await GetGuildMember(obj.guild_id, guild.auto.momId)
  let embedMsg = {
    color: 15844367,
    title: pObj.guildName+' mom watch settings'
  }
  embedMsg.description = ''
  embedMsg.description += 'Mom : '+(usr ? '@'+(usr.nick ? usr.nick:usr.user.username):'<@'+guild.auto.momId+'>')+'\n'
  if(guild?.auto?.momWatch?.length > 0){
    embedMsg.description += 'AllyCode - Name\n```\n'
    for(let i in guild.auto.momWatch) embedMsg.description += guild.auto.momWatch[i].allyCode+' - '+guild.auto.momWatch[i].name+'\n'
    embedMsg.description += '```'
  }
  msg2send.content = null
  msg2send.embeds = [embedMsg]
  return msg2send
}
