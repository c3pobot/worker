'use strict'
const { dataList } = require('src/helpers/dataList')
const checkMember = (defId, usedPlayers = {}, filterMember = [], rarity, relicTier)=>{
  let res = [], i = filterMember.length

  let combatType = dataList?.unitList[defId]?.combatType || 1
  while(i--){
    if(usedPlayers[filterMember[i].playerId]) continue;
    let unit = filterMember[i].roster[defId]
    if(!unit.baseId) continue
    if(unit.rarity < rarity) continue
    if(combatType === 1 && relicTier > unit.relicTier) continue
    res.push({ playerId: filterMember[i].playerId, name: filterMember[i].name, defId: unit.baseId, relicTier: unit.relicTier || 0, rarity: unit.rarity })
  }
  return res
}
const checkZone = (zone = {}, defId, usedPlayers = {}, filteredMember = [], tbDef = {}, map = {}, showPlayers)=>{
  for(let i in zone){
    let zoneDef = tbDef.conflictZoneDefinition.find(x=>x.zoneDefinition?.zoneId === zone[i].linkedConflictId)?.zoneDefinition, unit = dataList?.unitList[defId]

    if(!zoneDef?.nameKey || !unit?.name) continue
    if(!map[zoneDef.zoneId]) map[zoneDef.zoneId] = { zoneId: zoneDef.zoneId, nameKey: zoneDef.nameKey, sort: zoneDef.sort, key: zoneDef.phase+'-'+zoneDef.conflict, type: zoneDef.type, rarity: zone[i].rarity, relicTier: zone[i].relicTier, units: {} }
    if(!map[zoneDef.zoneId].units[defId]){
      let tempUnit = { baseId: defId, level: 85, nameKey: unit.name, thumbnailName: unit.thumbnailName, alignment: unit.alignment?.split('_')[1] || 'light', combatType: unit.combatType, rarity: zone[i].rarity, missing: zone[i].missing, players: [] }
      if(tempUnit.combatType === 1){
        tempUnit.gear = 1
        if(zone[i].relicTier > 0) tempUnit.relic = zone[i].relicTier + 2
        if(tempUnit.relic > 0) tempUnit.gear = 13
      }
      map[zoneDef.zoneId].units[defId] = tempUnit
    }
    if(showPlayers){
      let players = checkMember(defId, usedPlayers, filteredMember, zone[i].rarity, zone[i].relicTier)
      if(players?.length > 0) map[zoneDef.zoneId].units[defId].players = map[zoneDef.zoneId].units[defId].players.concat(players)
    }
  }
}
module.exports = (unitMap = {}, member = [], tbDef = {}, showPlayers = true)=>{
  let res = {}
  for(let i in unitMap){
    let filteredMember = member.filter(x=>x.roster[unitMap[i].defId]) || []
    checkZone(unitMap[i].zone, unitMap[i].defId, unitMap[i].players, filteredMember, tbDef, res, showPlayers)
  }
  return Object.values(res)
}
