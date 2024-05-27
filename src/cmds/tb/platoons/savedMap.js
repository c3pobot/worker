'use strict'
const sorter = require('json-array-sorter')
const numeral = require('numeral')

function getSquadNum(squadId){
  if(squadId?.includes('-platoon-1')) return 1
  if(squadId?.includes('-platoon-2')) return 2
  if(squadId?.includes('-platoon-3')) return 3
  if(squadId?.includes('-platoon-4')) return 4
  if(squadId?.includes('-platoon-5')) return 5
  if(squadId?.includes('-platoon-6')) return 6
}
function getSquadConfig(platoonIds = [], platoonId, squadNum){
  let res = {}, tempPlatoon = platoonIds.find(x=>x.id === platoonId)
  let tempSquad = tempPlatoon?.squads?.find(x=>x.num === squadNum)
  if(tempSquad) res = JSON.parse(JSON.stringify(tempSquad))
  return res
}
function getUnitCount(units = []){
  let res = {}
  for(let i in units){
    if(!res[units[i].baseId]){
      res[units[i].baseId] = JSON.parse(JSON.stringify(units[i]))
      res[units[i].baseId].count = 0
    }
    res[units[i].baseId].count++
  }
  return Object.values(res)
}
function getUnits(baseId, members = [], playerUnitCount = {}, preAssigned, maxUnit = 10){
  let res = members.filter(x=>(!playerUnitCount[x?.playerId] || maxUnit > playerUnitCount[x.playerId]) && (!preAssigned || !preAssigned?.has(x.playerId)))
  return res.filter(x=>x.rosterUnit?.filter(u=>u.definitionId?.startsWith(`${baseId}:`))?.length > 0).map(x=>{
    let unit = x.rosterUnit.find(y=>y.definitionId?.startsWith(baseId+':'))
    return { player: x.name, playerId: x.playerId, baseId: baseId, relicTier: +(unit?.relic?.currentTier || 0), rarity: +(unit.currentRarity || 0), level: +(unit.currentLevel || 0), tier: +(unit.currentTier || 0), sort: unit.sort }
  })
}
function getAssignedUnit(baseId, member, rarity, unitRelicTier){
  let unit = member?.rosterUnit.find(x=>x.definitionId?.startsWith(`${baseId}:`))
  if(!unit || unit?.currentRarity < rarity) return
  if(!unit.relic || unit.relic?.currentTier >= unitRelicTier) return { player: member.name, playerId: member.playerId, baseId: baseId, relicTier: +(unit?.relic?.currentTier || 0), rarity: +(unit.currentRarity || 0), level: +(unit.currentLevel || 0), tier: +(unit.currentTier || 0), sort: +(unit.relic?.currentTier || 0) + +(unit.currentTier || 0) }
}
function getNumUnits(member = [], baseId, relicTier = 1, rarity = 1, combatType = 1){
  return +(member.filter(x=>x.rosterUnit.filter(y=>y.definitionId?.startsWith(baseId+':') && y.currentRarity >= 0 && (combatType === 2 || y.relic?.currentTier >= relicTier)).length > 0).length || 0)
}
function getAvailableUnits(units, rarity, combatType, unitRelicTier, playerUnitCount = {}, maxUnit = 10){
  return units.filter(x=>x.rarity >= rarity && (combatType === 2 || x.relicTier >= unitRelicTier) && (!playerUnitCount[x?.playerId] || maxUnit > playerUnitCount[x.playerId]))
}
function mapUnits(unit = {}, platoon = {}, squad = {}, data = {}){
  if(unit.rarity > platoon.rarity) platoon.rarity = unit.rarity
  if(unit.unitRelicTier > platoon.relicTier) platoon.relicTier = unit.unitRelicTier
  if(!data.units[unit.baseId]) data.units[unit.baseId] = getUnits(unit.baseId, data.members, data.playerUnitCount, data.preAssigned[unit.baseId], platoon.maxUnit)
  if(unit.count < 0) unit.count = 0
  let assigned = squad.unitConfig?.find(x=>x.baseId === unit.baseId && x.players?.length > 0)?.players
  if(assigned?.length > 0){
    for(let i in assigned){
      let tempUnit = getAssignedUnit(unit.baseId, data.members?.find(x=>x.playerId === assigned[i]), unit.rarity, unit.unitRelicTier)
      if(!tempUnit) continue
      tempUnit.nameKey = unit.nameKey
      tempUnit.assigned = true
      tempUnit.player += ' (A)'
      squad.units.push(tempUnit)
      unit.count--
      data.units[unit.baseId] = data.units[unit.baseId].filter(x=>x.playerId !== assigned[i])
    }
  }
  if(unit.count < 0) unit.count = 0
  let avaliableUnits = getAvailableUnits(data.units[unit.baseId], unit.rarity, unit.combatType, unit.unitRelicTier, data.playerUnitCount, platoon.maxUnit)
  if(avaliableUnits?.length > 0) avaliableUnits = sorter([{ column: 'sort', order: 'ascending' }], avaliableUnits)
  let prefilled = squad.unitConfig?.find(x=>x.baseId === unit.baseId && x.prefilled > 0)
  if(prefilled?.baseId){
    for(let i = 0;i<prefilled.prefilled;i++){
      squad.units.push({nameKey: unit.nameKey, player: 'Prefilled', baseId: unit.baseId})
      unit.count--
    }
  }


  if(unit.count > 0 && +avaliableUnits?.length > 0 && +avaliableUnits?.length >= unit.count){
    for(let i = 0;i<unit.count;i++){
      if(!avaliableUnits[i]) continue
      avaliableUnits[i].nameKey = unit.nameKey
      squad.units.push(avaliableUnits[i])
      data.units[unit.baseId] = data.units[unit.baseId].filter(x=>x.playerId !== avaliableUnits[i].playerId)
      if(!data.playerUnitCount[avaliableUnits[i].playerId]) data.playerUnitCount[avaliableUnits[i].playerId] = 0
      data.playerUnitCount[avaliableUnits[i].playerId] += 1
    }
  }else{
    for(let i = 0;i<unit.count;i++){
      squad.units.push({nameKey: unit.nameKey, baseId: unit.baseId, available: +avaliableUnits?.length, count: getNumUnits(data.members, unit.baseId, unit.unitRelicTier, unit.rarity, unit.combatType)})
    }
  }
}
function mapSquads(squad = {}, pDef = {}, platoon = {}, data = {}){
  let tempSquad = { id: squad.id, num: squad.num, units: [], points: 0, nameKey: pDef.id+' '+pDef.nameKey}, squadConfig = getSquadConfig(data.platoonIds, pDef.id, squad.num)

  if(squadConfig) tempSquad = { ...tempSquad, ...squadConfig }
  if(tempSquad.exclude || tempSquad.prefilled) return tempSquad
  let unitCounts = getUnitCount(squad.units)

  for(let i in unitCounts) mapUnits(unitCounts[i], platoon, tempSquad, data)

  if(tempSquad?.units?.length > 0 && tempSquad.units.length === tempSquad.units.filter(x=>x.player).length){
    tempSquad.points = squad.points
  }
  return tempSquad
}
function getPlayerUnitCount(pDef = {}, platoonIds){
  let res = {}, config = platoonIds.find(x=>x.id === pDef.id)
  if(!config?.squads || config.squads?.length === 0) return res
  config.squads.map(s=>{
    if(!s.unitConfig || s.unitConfig?.length === 0) return false
    s.unitConfig.map(u=>{
      if(!u.players || u.players?.length === 0) return false
      u.players.map(p=>{
        if(!res[p]) res[p] = 0
        res[p] += 1
        return true
      })
      return true
    })
    return true
  })
  return res
}
function mapPlatoonDef(pDef = {}, data = {}){
  let tempPlatoon = JSON.parse(JSON.stringify(pDef)), squads = (JSON.parse(JSON.stringify(pDef.squads)))
  tempPlatoon.squads = []
  tempPlatoon.points = 0
  tempPlatoon.rarity = 1
  tempPlatoon.relicTier = 0
  for(let i in squads){
    let cgIsDumb = true
    if(+i === 0){
      let tempSquadNum = getSquadNum(squads[i].id)
      if(tempSquadNum === 1) cgIsDumb = false
    }
    squads[i].num = (cgIsDumb ? (+i + 1):getSquadNum(squads[i].id))
  }
  squads = sorter([{ column: 'num', order: 'ascending'}], squads)
  data.playerUnitCount = getPlayerUnitCount(pDef, data.platoonIds)
  if(!tempPlatoon.exclude && !tempPlatoon.prefilled){
    for(let i in squads){
      let tempSquad = mapSquads(squads[i], pDef, tempPlatoon, data)
      tempPlatoon.squads.push(tempSquad)
    }
  }
  if(tempPlatoon.squads?.length > 0) tempPlatoon.squads = sorter([{ column: 'num', order: 'ascending'}], tempPlatoon.squads)
  tempPlatoon.points = tempPlatoon.squads.reduce((acc, x)=> acc + x.points || 0 , 0)
  return tempPlatoon
}
function getPreAssigned(platoonIds = []){
  let res = {}
  platoonIds?.map(p=>{
    if(!p?.squads || p.squads.length === 0) return false
    p.squads.map(s=>{
      if(!s.unitConfig || s.unitConfig?.length === 0) return false
      s.unitConfig?.map(u=>{
        if(!u.players || u.players?.length === 0) return false
        u.players.map(x=>{
          if(!res[u.baseId]) res[u.baseId] = new Set()
          res[u.baseId].add(x)
          return true
        })
        return true
      })
      return true
    })
    return true
  })
  return res
}

function getPlatoonConfig(platoonConfig = [], pDef = []){
  let res = []
  for(let i in platoonConfig){
    let tempPlatoon = pDef.find(x=>x.id === platoonConfig[i].id)
    if(!tempPlatoon) continue
    let tempObj = JSON.parse(JSON.stringify(tempPlatoon))
    tempObj.exclude = platoonConfig[i].exclude
    tempObj.prefilled = platoonConfig[i].prefilled
    res.push(tempObj)
  }
  return res
}
module.exports = (members = [], pDefinition = [], platoonIds = [], tbDay = 1)=>{
  let data = { units: {}, preAssigned: getPreAssigned(platoonIds), platoonIds: platoonIds, members: members }, platoons = [], res = {}

  let pDef = getPlatoonConfig(platoonIds || pDefinition.filter(x=>x.phase === 'P'+tbDay), pDefinition)
  if(pDef?.length > 0) pDef = sorter([{column: 'sort', order: 'ascending'}], pDef)

  for(let i in pDef){
    let tempPlatoon = mapPlatoonDef(pDef[i], data)
    platoons.push(tempPlatoon)
  }
  res.platoons = platoons
  if(platoons?.length === 0) res.content = 'You have excluded or prefilled all platoons for Round '+tbDay
  return res

}
