'use strict'
const mongo = require('mongoclient')
const { checkGuildAdmin, getGuildId } = require('src/helpers')
const swgohClient = require('src/swgohClient')

module.exports = async(obj = {}, opt = {})=>{
  let auth = await checkGuildAdmin(obj, opt, null)
  if(!auth) return { content: 'This command is only available to guild admins' }

  let allyCode = opt.allycode?.value?.toString()?.trim()?.replace(/-/g, '')
  if(!allyCode) return { content: 'you did not provide an allyCode'}

  let pObj = await getGuildId({dId: obj.member.user.id}, {}, opt)
  if(!pObj?.guildId) return { content: 'Error getting player guild' }
  let guild = (await mongo.find('guilds', {_id: pObj.guildId}))[0]
  if(!guild){
    guild = { _id: pObj.guildId, guildName: pObj.guildName }
    await mongo.set('guilds', { _id: pObj.guildId }, { guildName: pObj.guildName })[0]
  }
  if(guild?.sId !== obj.guild_id) return { content: 'Your guild is not linked to this server' }

  if(!guild.auto) guild.auto = {}
  if(!guild.auto?.momWatch) guild.auto.momWatch = []
  let player = await swgohClient.post('queryPlayer', { allyCode: allyCode }, null)
  if(!player?.name) return { content: '**'+allyCode+'** is not a valid allyCode' }
  if(player.guildId !== pObj.guildId) return { content: '**'+allyCode+'** for **'+player.name+'** is not part of guild **'+pObj.guildName+'**' }
  if(guild?.auto?.momWatch?.filter(x=>x.allyCode === +allyCode).length > 0) return { content: '**'+allyCode+'** is already in the mom watch list' }

  guild.auto.momWatch.push({ allyCode: +allyCode, playerId: player.playerId,  name: player.name })
  await mongo.set('guilds', { _id: pObj.guildId }, { 'auto.momWatch': guild.auto.momWatch })
  return { content: '**'+player.name+'** with allyCode **'+allyCode+'** was added to the mom watch list for guild **'+pObj.guildName+'**' }
}
