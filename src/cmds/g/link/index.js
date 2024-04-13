'use strict'
const mongo = require('mongoclient')
const { checkServerAdmin, getGuildId } = require('src/helpers')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'This command is only available to server admin\'s'}, pObj, guild
  let auth = await checkServerAdmin(obj)
  if(auth){
    msg2send.content = 'Error finding your guild'
    pObj = await getGuildId({dId: obj.member.user.id}, {}, opt)
  }
  if(pObj?.guildId){
    guild = (await mongo.find('guilds', {_id: pObj.guildId}))[0]
    if(!guild){
      guild = {_id: pObj.guildId, guildName: pObj.guildName}
      await mongo.set('guilds', {_id: pObj.guildId}, {guildName: pObj.guildName})[0]
    }
  }
  if(guild?._id){
    let exists = await mongo.find('discordServer', {'guilds.guildId': pObj.guildId})
    if(exists && exists.length > 0){
      for(let i in exists) await mongo.pull('discordServer', {_id: exists[i]._id}, {guilds: {guildId: pObj.guildId}})
    }
    await mongo.set('guilds', {_id: pObj.guildId}, {sId: obj.guild_id})
    await mongo.push('discordServer', {_id: obj.guild_id}, {guilds: {guildId: pObj.guildId, guildName:pObj.guildName}})
    msg2send.content = '**'+pObj.guildName+'** has been linked to this discord server and unlinked from any other servers'
  }
  return msg2send
}
