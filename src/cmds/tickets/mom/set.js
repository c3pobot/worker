'use strict'
const mongo = require('mongoclient')
const { checkGuildAdmin, getGuildId } = require('src/helpers')

module.exports = async(obj = {}, opt = {})=>{
  let auth = await checkGuildAdmin(obj, opt, null)
  if(!auth) return { content: 'This command is only available to guild admins' }

  let usr = opt.user?.data
  if(!usr) return { content: 'you did not mention a user' }

  let pObj = await getGuildId({dId: obj.member.user.id}, {}, opt)
  if(!pObj?.guildId) return { content: 'Error getting player guild' }

  let guild = (await mongo.find('guilds', {_id: pObj.guildId}))[0]
  if(!guild){
    guild = {_id: pObj.guildId, guildName: pObj.guildName}
    await mongo.set('guilds', {_id: pObj.guildId}, {guildName: pObj.guildName})[0]
  }
  if(guild?.sId !== obj.guild_id) return { content: 'Your guild is not linked to this server' }

  await mongo.set('guilds', { _id: pObj.guildId }, { 'auto.momId': usr.id })
  return { content: `@${usr.nick || usr.usr?.username} was added as the mom for guild ${pObj.guildName}...` }
}
