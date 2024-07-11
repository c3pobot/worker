'use strict'
const mapUnit = (unit = {}, zoneDefinition = {}, map = {}, squadId)=>{
  let defId = unit.unitIdentifier.split(':')[0], zoneId = zoneDefinition?.zoneDefinition?.zoneId
  if(!defId || !zoneId) return
  let relicTier = 0
  if(zoneDefinition.unitRelicTier >= 2) relicTier = zoneDefinition.unitRelicTier - 2
  if(!map[defId]) map[defId] = { defId: defId, players: {}, zone: {}, missing: 0 }
  if(!map[defId].zone[zoneId]) map[defId].zone[zoneId] = {linkedConflictId: zoneDefinition?.zoneDefinition?.linkedConflictId, rarity: zoneDefinition.unitRarity, relicTier: relicTier, missing: 0 }
  if(unit.memberId === ''){
    ++map[defId].zone[zoneId].missing
    ++map[defId].missing
  }else{
    map[defId].players[unit.memberId] = unit.memberId
  }
}
const checkUnit = (unit = [], zoneDefinition = {}, map = {}, squadId)=>{
  let i = unit.length
  while(i--){
    mapUnit(unit[i], zoneDefinition, map, squadId)
  }
}
const checkSquad = (squad = [], zoneDefinition = {}, map = {})=>{
  let i = squad.length, res = []
  while(i--){
    checkUnit(squad[i].unit, zoneDefinition, map, squad[i].id)
  }
}
const checkPlatoon = (platoon = [], zoneDefinition = {}, map = {})=>{
  let i = platoon.length
  while(i--){
    checkSquad(platoon[i].squad, zoneDefinition, map)
  }
}
module.exports = (reconZoneStatus = [], reconZoneDefinition = [])=>{
  let i = reconZoneStatus.length, map = {}, res = {}, count = 0
  while(i--){
    let zoneDefinition = reconZoneDefinition.find(x=>x?.zoneDefinition?.zoneId === reconZoneStatus[i].zoneStatus.zoneId)
    if(zoneDefinition?.zoneDefinition) checkPlatoon(reconZoneStatus[i].platoon, zoneDefinition, map)
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
}
