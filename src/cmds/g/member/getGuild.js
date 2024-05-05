'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const cache = require('src/helpers/cache')
const swgohClient = require('src/swgohClient')
const getPlayer = async(playerId, name)=>{
  try{
    let obj = await cache.playerId.get(playerId)
    if(!obj?.allyCode) obj = await swgohClient.post('playerArena', { playerId: playerId, playerDetailsOnly: true } )
    if(obj?.allyCode){
      let dObj = (await mongo.find('discordId', { 'allyCodes.allyCode': +obj.allyCode }, { allyCodes: { allyCode: 1 } }))[0]
      return { playerId: playerId, allyCode: +obj.allyCode, name: obj.name || name, dId: dObj?.allyCodes?.length > 0 ? 1:0 }
    }
  }catch(e){
    log.error(e)
  }
}
const getMembers = async(member = [])=>{
  let array = [], i = member.length
  while(i--) array.push(getPlayer(member[i].playerId, member[i].playerName))
  let res = await Promise.allSettled(array)
  return res?.filter(x=>x?.value?.playerId)?.map(x=>x.value)
}
module.exports = async(guildId)=>{
  if(!guildId) return
  let guild = await cache.guild.get('guildCache', guildId)
  if(!guild){
    guild = await swgohClient.post('guild', { guildId: guildId, includeRecentGuildActivityInfo: true } )
    if(guild.guild){
      guild = guild.guild
      guild.name = guild.profile?.name
    }
  }
  if(!guild.member || guild.member?.length == 0) return { msg2send: 'error getting guild' }

  let members = await getMembers(guild.member)
  if(!members || members?.length !== guild.member.length) return { msg2send: 'error getting guildMembers' }

  guild.member = members
  return guild
}
