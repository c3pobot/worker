'use strict'
const mongo = require('mongoclient')
const { checkGuildAdmin, getGuildId } = require('src/helpers')

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
  if(!guild?.auto?.momId) return { content: 'there is not a mom set' }
  msg2send.content = '<@'+guild.auto.momId+'> was unset as the mom for guild **'+pObj.guildName+'**'
  await mongo.unset('guilds', {_id: pObj.guildId}, {'auto.momId': guild.auto.momId})
  return msg2send
}
