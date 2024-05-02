'use strict'
const cache = require('src/helpers/cache')
const swgohClient = require('src/swgohClient')

const getMembersFromCache = async(memberIds = [])=>{
  let i = memberIds?.length, array = []
  while(i--) array.push(cache.player.get('playerCache', memberIds[i], null, { playerId: 1, name: 1, allyCode: 1}))
  let res = await Promise.allSettled(array)
  return res?.filter(x=>x.value?.playerId).map(x=>x.value)
}
module.exports = async(guildId)=>{
  let memberIds, members
  let guild = await cache.guild.get('guildCache', guildId)
  if(!guild){
    guild = await swgohClient.post('guild', { guildId: guildId, includeRecentGuildActivityInfo: false} )
    if(guild.guild){
      guild = guild.guild
      guild.name = guild.profile?.name
    }
  }
  if(guild?.member?.length > 0) memberIds = guild.member.map(x=>x.playerId)
  if(memberIds?.length > 0) members = await getMembersFromCache(memberIds)
  if(memberIds?.length > 0 && members?.length >= 0 && members?.length != guild?.member?.length){
    let foundMembers = members.map(x=>x.playerId)
    let missingMembers = guild.member.filter(x=>!foundMembers.includes(x.playerId))
    let tempMembers = await swgohClient.post('queryArenaPlayers', { players: missingMembers, detailsOnly: false })
    if(tempMembers?.length > 0) members = members.concat(tempMembers)
  }
  if(guild?.member?.length > 0 && members?.length == guild.member.length){
    guild.member = members
    return guild
  }
}
