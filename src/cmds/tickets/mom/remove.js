'use strict'
const mongo = require('mongoclient')
const swgohClient = require('src/swgohClient')
const { checkGuildAdmin, getGuildId } = require('src/helpers')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'This command is only available to guild admins'}
  let auth = await checkGuildAdmin(obj, opt, null)
  if(!auth) return msg2send
  let allyCode = getOptValue(opt, 'allycode')?.toString()?.trim()?.replace(/-/g, '')
  if(!allyCode) return { content: 'you did not provide an allyCode'}
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
  msg2send.content = '**'+allyCode+'** is not a valid allyCode'
  let player = await swgohClient.post('queryPlayer', {allyCode: allyCode.toString()}, null)
  if(!player?.name) return msg2send
  msg2send.content = '**'+allyCode+'** is not in the mom watch list'
  if(guild?.auto?.momWatch?.filter(x=>x.allyCode == +allyCode).length > 0){
    await mongo.pull('guilds', {_id: pObj.guildId}, {'auto.momWatch': {allyCode: +allyCode}})
    msg2send.content = '**'+player.name+'** with allyCode **'+allyCode+'** was removed from the mom watch list for guild **'+pObj.guildName+'**'
  }
  return msg2send
}
