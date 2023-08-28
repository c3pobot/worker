'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const updatedDataCounts = require('../fetchGuild/updatedDataCounts')
const getPlayer = require('../getPlayer')
const getCachePlayers = async(memberIds = [], dataCount = {}, collection, summaryNeeded, project)=>{
  try{
    if(project) project.playerId = 1
    let res = await mongo.find(collection, {_id: { $in: memberIds }}, project)
    if((res?.length > 0 && res.length !== memberIds.length) || summaryNeeded){
      log.debug('updating guild dataCounts for cached players ...')
      let i = res.length
      while( i-- ) updatedDataCounts(res[i], dataCount)
    }
    return res
  }catch(e){
    throw(e)
  }
}

const getNewPlayers = async(member = [], dataCount = {}, summaryNeeded)=>{
  try{
    let res = [], players = []
    const getGuildPlayer = async(guildMember)=>{
      if(!guildMember) throw('member not provided fetchGuild->getPlayers->getNewPlayers')
      let player = await getPlayer({ playerId: guildMember.playerId, collection: 'twPlayerCache' })
      if(player?.summary && player?.roster){
        if(summaryNeeded) updatedDataCounts(player, dataCount)
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
module.exports = async(guildId, member = [], dataCount = {}, collection, summaryNeeded, project)=>{
  try{
    let foundMemberIds = [], memberIds = member.map(x=>x.playerId)
    log.debug('checking cache for '+member.length+' members...')
    let res = await getCachePlayers(memberIds, dataCount, collection, summaryNeeded, project)
    if(!res) return
    log.debug('found '+res.length+' members in '+collection+'...')
    if(res?.length === member.length){
      if(summaryNeeded) mongo.set('twGuildCache', {_id: guildId}, { summary: dataCount })
      return res
    }
    if(res?.length > 0) foundMemberIds = res.map(x=>x.playerId)
    let missingMembers = member.filter(x=>!foundMemberIds.includes(x.playerId))
    let missing = await getNewPlayers(missingMembers, dataCount, summaryNeeded)
    if(missing?.length > 0) res = res.concat(missing)
    log.debug('pulled '+missing?.length+' members from client...')
    if(res.length === member.length){
      mongo.set('twGuildCache', {_id: guildId}, { summary: dataCount })
      return res
    }
  }catch(e){
    throw(e);
  }
}
