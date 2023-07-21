'use strict'
const log = require('logger')
const { mongo } = require('helpers/mongo')
const updatedDataCounts = require('./updatedDataCounts')
const getPlayer = require('../getPlayer')
const getCachePlayers = async(memberIds = [], dataCount = {}, collection = 'playerCache', project)=>{
  try{
    if(project) project.playerId = 1
    let res = await mongo.find(collection, {_id: { $in: memberIds }}, project)
    if(res?.length > 0){
      let i = res.length
      while( i-- ) updatedDataCounts(res[i], dataCount)
    }

    return res
  }catch(e){
    throw(e)
  }
}

const getNewPlayers = async(member = [], dataCount = {}, collection = 'playerCache')=>{
  try{
    let res = [], players = []
    const getGuildPlayer = async(guildMember)=>{

      if(!guildMember) throw('member not provided fetchGuild->getPlayers->getNewPlayers')
      let player = await getPlayer({ playerId: guildMember.playerId, collection: collection })
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
module.exports = async(guildId, member = [], dataCount = {}, collection = 'playerCache', project)=>{
  try{
    let foundMemberIds = [], memberIds = member.map(x=>x.playerId)
    log.debug('checking cache for '+member.length+' members...')
    let res = await getCachePlayers(memberIds, dataCount, collection, project)
    if(!res) return
    log.debug('found '+res.length+' memebers in cache...')
    if(res?.length === member.length) return res
    if(res?.length > 0) foundMemberIds = res.map(x=>x.playerId)
    let missingMembers = member.filter(x=>!foundMemberIds.includes(x.playerId))
    let missing = await getNewPlayers(missingMembers, dataCount, collection)
    if(missing?.length > 0) res = res.concat(missing)
    log.debug('pulled '+missing?.length+' members from client...')
    if(res.length === member.length) return res
  }catch(e){
    throw(e);
  }
}
