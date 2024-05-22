'use strict'
module.exports = (baseId, members = [], playerUnitCount = {}, maxUnit = 10)=>{
  return members.filter(x=>x.rosterUnit?.filter(y=>y.definitionId?.startsWith(baseId+':') && (!playerUnitCount[x?.playerId] || maxUnit > playerUnitCount[x?.playerId])).length > 0 ).map(m=>{
    let rosterUnits = m.rosterUnit.find(x=>x.definitionId?.startsWith(baseId+':'))
    return {
      player: m.name,
      playerId: m.playerId,
      allyCode: m.allyCode,
      baseId: baseId,
      relicTier: rosterUnits?.relic?.currentTier || 0,
      rarity: rosterUnits?.currentRarity || 0,
      level: rosterUnits?.currentLevel || 0,
      tier: rosterUnits?.currentTier || 0,
      gp: rosterUnits?.gp || 0,
      combatType: rosterUnits?.combatType || 0,
      sort: rosterUnits?.sort || 0
    }
  })
}
