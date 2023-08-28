'use strict'
const mongo = require('mongoclient')
const queryGuild = require('./queryGuild')
const queryPlayer = require('./queryPlayer')
const getGuildId =  require('./getGuildId')
const playerCollectionEnum = {guildCache: 'playerCache', twGuildCache: 'twPlayerCache'}

const getMissingMembers = async(missing = [])=>{
  try{
    let res = [], i = missing.length
    while(i--) res.push(queryPlayer({playerId: missing[i].playerId}))
    return await Promise.all(res)
  }catch(e){
    throw(e)
  }
}
module.exports = async(opts = {})=>{
  try{
    let collection = opts.collection || 'guildCache', playerCollection = playerCollectionEnum[collection] || 'playerCache'
    let guildId = await getGuildId(opts)
    if(!guildId) return
    let guild = (await mongo.find('guilds', {_id: guildId}, opts.guildProject))[0]
    if(!guild) guild = await queryGuild({guildId: guildId})
    if(!guild) return
    guild.member = guild.member.filter(x=>x.memberLevel > 1)
    let foundMembers = (await mongo.find(playerCollection, {guildId: guildId}))
    if(foundMembers?.length === guild.member.length){
      guild.member = foundMembers
      return guild
    }
    let foundMemberIds = foundMembers.map(x=>x.playerId)
    let missingMembersIds = guild.member.filter(x=>!foundMemberIds.includes(x.playerId))
    let missingMembers = await getMissingMembers(missingMembersIds)
    if(!missing) return
    foundMembers = foundMembers.concat(missingMembers)
    if(foundMembers?.length === guild.member.length){
      guild.member = foundMembers
      return guild
    }
  }catch(e){
    throw(e)
  }
}
