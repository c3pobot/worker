'use strict'
const fs = require('fs')
const { mongo } = require('helpers/mongo')
const updatedDataCounts = require('./updatedDataCounts')
const getPlayer = require('../getPlayer')
const getCachePlayers = async(guildId, dataCount = {}, collection = 'playerCache', project)=>{
  try{
    if(project) project.playerId = 1
    let res = await mongo.find(collection, {guildId: guildId}, project)
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
    let res = []
    const getGuildPlayer = async(guildMember)=>{

      if(!guildMember) throw('member not provided fetchGuild->getPlayers->getNewPlayers')
      let player = await getPlayer({ playerId: guildMember.playerId, collection: collection })
      if(player?.summary){
        player.memberContribution = guildMember.memberContribution
        updatedDataCounts(player, dataCount)
        res.push(player)
      }
    }
    let i = member.length
    while(i--) res.push(getGuildPlayer(member[i]))
    return await Promise.all(res)
  }catch(e){
    throw(e)
  }
}
module.exports = async(guildId, member = [], dataCount = {}, collection = 'playerCache', project)=>{
  try{
    let foundMemberIds = []
    let res = await getCachePlayers(guildId, dataCount, collection, project)
    if(!res) return
    if(res?.length === member.length) return res
    if(res?.length > 0) foundMemberIds = res.map(x=>x.playerId)
    let missingMembers = member.filter(x=>!foundMemberIds.includes(x.playerId))
    let missing = await getNewPlayers(missingMembers, dataCount, collection)
    if(missing?.length > 0) res = res.concat(missing)
    if(res.length === member.length) return res
  }catch(e){
    throw(e);
  }
}
