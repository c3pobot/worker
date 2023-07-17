'use strict'
const { log, mongo } = require('helpers')
const swgohClient = require('swgohClient')
const { configMaps } = require('helpers/configMaps')
const getMissingMembers = async(member = [])=>{
  try{
    let res = [], i = member.length
    while(i--) res.push(swgohClient('queryPlayer', { playerId: member[i].playerId }))
    return await Promise.all(res)
  }catch(e){
    throw(e)
  }
}
module.exports.getGuild = async(dObj = {}, obj = {})=>{
  try{
    let guild = (await mongo.find('missingPlatoonCache', {_id: dObj.uId}, {_id: 0, TTL: 0}))[0]
    if(!guild){
      guild = await swgohClient('guild', {}, dObj, obj)
      if(guild?.data?.guild){
        guild = guild.data.guild
        guild.member = guild.member.filter(x=>x.memberLevel > 1)
        mongo.set('missingPlatoonCache', {_id: dObj.uId}, guild)
      }
    }
    return guild
  }catch(e){
    throw(e)
  }
}
module.exports.getGuildMembers = async(member = [], guildId)=>{
  try{
    let res = await mongo.find('playerCache', {guildId: guildId}, { playerId: 1, name: 1, rosterUnit: 1, guildId: 1 })
    if(res?.length === member.length) return res
    let foundMemberIds = res.map(x=>x.playerId)
    let missingMembers = member.filter(x=>!foundMemberIds.includes(x.playerId))
    let missing = await getMissingMembers(missingMembers)
    if(missing?.length > 0) res = res.concat(missing)
    if(res?.length === member.length) return res
  }catch(e){
    throw(e)
  }
}
const mapUnit = (unit = {}, zoneDefinition = {}, map = {}, squadId)=>{
  try{
    let defId = unit.unitIdentifier.split(':')[0]
    if(!map[defId]) map[defId] = { defId: defId, players: {}, zone: {}, missing: 0 }
    if(!map[defId].zone[zoneDefinition.zoneId]) map[defId].zone[zoneDefinition.zoneId] = {linkedConflictId: zoneDefinition.linkedConflictId, rarity: zoneDefinition.unitRarity, relicTier: zoneDefinition.unitRelicTier, missing: 0 }
    if(unit.memberId === ''){
      ++map[defId].zone[zoneDefinition.zoneId].missing
      ++map[defId].missing
    }else{
      map[defId].players[unit.memberId] = unit.memberId
    }
  }catch(e){
    throw(e)
  }
}
const checkUnit = (unit = [], zoneDefinition = {}, map = {}, squadId)=>{
  try{
    let i = unit.length
    while(i--){
      mapUnit(unit[i], zoneDefinition, map, squadId)
    }
  }catch(e){
    throw(e)
  }
}
const checkSquad = (squad = [], zoneDefinition = {}, map = {})=>{
  try{
    let i = squad.length, res = []
    while(i--){
      checkUnit(squad[i].unit, zoneDefinition, map, squad[i].id)
    }
  }catch(e){
    throw(e)
  }
}
const checkPlatoon = (platoon = [], zoneDefinition = {}, map = {})=>{
  try{
    let i = platoon.length
    while(i--){
      checkSquad(platoon[i].squad, zoneDefinition, map)
    }
  }catch(e){
    throw(e)
  }
}
module.exports.getUnitMap = (reconZoneStatus = [], reconZoneDefinition = {})=>{
  try{
    let i = reconZoneStatus.length, map = {}, res = {}, count = 0
    while(i--){
      let zoneDefinition = reconZoneDefinition[reconZoneStatus[i].zoneStatus.zoneId]
      checkPlatoon(reconZoneStatus[i].platoon, zoneDefinition, map)
    }
    for(let i in map){
      if(map[i].missing > 0){
        res[i] = { defId: map[i].defId, players: map[i].players, missing: map[i].missing,  zone: {} }
        for(let z in map[i].zone){
          if(map[i].zone[z].missing > 0) res[i].zone[z] = map[i].zone[z]
        }
        count += map[i].missing
      }
    }
    return { missingUnits: count, unitMap: res }
  }catch(e){
    throw(e)
  }
}
const filterMember = (defId, member = [])=>{
  try{
    let res = [], i = member.length
    while(i--){
      let unit = member[i].rosterUnit?.find(x=>x.definitionId.startsWith(defId+':'))
      if(unit) res.push({ playerId: member[i].playerId, name: member[i].name, defId: defId, relicTier: unit.relic?.currentTier || 0, rarity: unit.currentRarity})
    }
    return res
  }catch(e){
    throw(e)
  }
}
const checkMember = (defId, usedPlayers = {}, filterMember = [], rarity, relicTier)=>{
  try{
    let res = [], i = filterMember.length
    let combatType = configMaps.UnitMap[defId]?.combatType || 1
    while(i--){
      if(usedPlayers[filterMember[i].playerId]) continue;
      if(combatType === 1){
        if(filterMember[i].rarity >= rarity && filterMember[i].relicTier >= relicTier) res.push(filterMember[i])
      }else{
        if(filterMember[i].rarity >= rarity) res.push(filterMember[i])
      }
    }
    return res
  }catch(e){
    throw(e)
  }
}
const checkZone = (zone = {}, defId, usedPlayers = {}, filteredMember = [], tbDef = {}, map = {}, showPlayers)=>{
  try{
    for(let i in zone){
      let zoneDef = tbDef.conflictZoneDefinition[zone[i].linkedConflictId]
      if(!zoneDef) continue
      if(!map[zoneDef.zoneId]) map[zoneDef.zoneId] = { zoneId: zoneDef.zoneId, nameKey: zoneDef.nameKey, sort: zoneDef.sort, key: zoneDef.phase+'-'+zoneDef.conflict, type: zoneDef.type, rarity: zone[i].rarity, relicTier: zone[i].relicTier, units: {} }
      if(!map[zoneDef.zoneId].units[defId]){
        let tempUnit = { baseId: defId, nameKey: configMaps.UnitMap[defId]?.nameKey || defId, icon: configMaps.UnitMap[defId]?.icon, alignment: configMaps.UnitMap[defId]?.alignment, combatType: configMaps.UnitMap[defId]?.combatType, rarity: zone[i].rarity, missing: zone[i].missing, players: [] }
        if(tempUnit.combatType === 1){
          tempUnit.gearTier = 1
          if(zone[i].relicTier > 1) tempUnit.relicTier = zone[i].relicTier - 2
          if(tempUnit.relicTier >= 0) tempUnit.gearTier = 13
        }
        map[zoneDef.zoneId].units[defId] = tempUnit
      }
      if(showPlayers){
        let players = checkMember(defId, usedPlayers, filteredMember, zone[i].rarity, zone[i].relicTier)
        if(players?.length > 0) map[zoneDef.zoneId].units[defId].players = map[zoneDef.zoneId].units[defId].players.concat(players)
      }
    }
  }catch(e){
    throw(e)
  }
}
module.exports.getMissingUnitMap = (unitMap = {}, member = [], tbDef = {}, showPlayers = true)=>{
  try{
    let res = {}
    for(let i in unitMap){
      let filteredMember = []
      if(showPlayers) filteredMember = filterMember(unitMap[i].defId, member)
      checkZone(unitMap[i].zone, unitMap[i].defId, unitMap[i].players, filteredMember, tbDef, res, showPlayers)
    }
    return Object.values(res)
  }catch(e){
    throw(e)
  }
}
module.exports.getTimeTillEnd = (timestamp)=>{
  let timeNow = Date.now()
  if(+timeNow < +timestamp){
    let delta = Math.abs(+timestamp - +timeNow) / 1000
    let hours = Math.floor(delta / 3600)
    delta -= hours * 3600
    let minutes = Math.floor(delta / 60)
    delta -= minutes * 60
    let seconds = Math.floor(delta)
    return({
      h: hours.toString().padStart(2, '0'),
      m: minutes.toString().padStart(2, '0'),
      s: seconds.toString().padStart(2, '0')
    })
  }else{
    return({
      h: '00',
      m: '00',
      s: '00'
    })
  }
}
