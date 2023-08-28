'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const updatedDataCounts = require('./updatedDataCounts')
const getPlayer = require('../getPlayer')
const getCachePlayers = async(memberIds = [], dataCount = {}, project)=>{
  try{
    if(project) project.playerId = 1
    let res = await mongo.find('playerCache', {_id: { $in: memberIds }}, project)
    if(res?.length > 0){
      let i = res.length
      while( i-- ) updatedDataCounts(res[i], dataCount)
    }
    return res
  }catch(e){
    throw(e)
  }
}

const getNewPlayers = async(member = [], dataCount = {})=>{
  try{
    let res = [], players = []
    const getGuildPlayer = async(guildMember)=>{
      if(!guildMember) throw('member not provided fetchGuild->getPlayers->getNewPlayers')
      let player = await getPlayer({ playerId: guildMember.playerId, collection: 'playerCache' })
      if(player?.summary && player?.roster){
        player.memberContribution = guildMember.memberContribution
        updatedDataCounts(player, dataCount)
        players.push(player)
      }
    }
    let i = member.length
    while(i--) res.push(getGuildPlayer(member[i]))
    await Promise.all(res)
    return players
  }catch(e){
    throw(e)
  }
}
module.exports = async(guildId, member = [], dataCount = {}, project)=>{
  try{
    let foundMemberIds = [], memberIds = member.map(x=>x.playerId)
    log.debug('checking cache for '+member.length+' members...')
    let res = await getCachePlayers(memberIds, dataCount, project)
    if(!res) return
    log.debug('found '+res.length+' memebers in cache...')
    if(res?.length === member.length) return res
    if(res?.length > 0) foundMemberIds = res.map(x=>x.playerId)
    let missingMembers = member.filter(x=>!foundMemberIds.includes(x.playerId))
    let missing = await getNewPlayers(missingMembers, dataCount)
    if(missing?.length > 0) res = res.concat(missing)
    log.debug('pulled '+missing?.length+' members from client...')
    if(res.length === member.length) return res
  }catch(e){
    throw(e);
  }
}
