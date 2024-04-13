'use strict'
const mongo = require('mongoclient')
const swgohClient = require('src/swgohClient')

module.exports = async(guildId)=>{
  let memberIds, members
  let guild = (await mongo.find('guildCache', {_id: guildId}, { name: 1, member: { playerId: 1}}))[0]
  if(!guild){
    guild = await swgohClient.post('guild', { guildId: guildId, includeRecentGuildActivityInfo: false} )
    if(guild.guild){
      guild = guild.guild
      guild.name = guild.profile?.name
    }
  }
  if(guild?.member?.length > 0) memberIds = guild.member.map(x=>x.playerId)
  if(memberIds?.length > 0) members = await mongo.find('playerCache', {_id: {$in: memberIds}}, { playerId: 1, name: 1, allyCode: 1 })
  if(memberIds?.length > 0 && members?.length >= 0 && members?.length != guild?.member?.length){
    let foundMembers = members.map(x=>x.playerId)
    let missingMembers = guild.member.filter(x=>!foundMembers.includes(x.playerId))
    let tempMembers = await swgohClient.post('queryArenaPlayers', {players: missingMembers, detailsOnly: false})
    if(tempMembers?.length > 0) members = members.concat(tempMembers)
  }
  if(guild?.member?.length > 0 && members?.length == guild.member.length){
    guild.member = members
    return guild
  }
}
