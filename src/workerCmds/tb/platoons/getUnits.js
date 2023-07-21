'use strict'
module.exports = (baseId, members = [], playerUnitCount = {}, maxUnit = 10)=>{
  try{
    /*
    return await members.filter(x=>x.rosterUnit && x.rosterUnit?.filter(y=>y.definitionId?.startsWith(baseId+':') && (!playerUnitCount[x?.playerId] || maxUnit > playerUnitCount[x?.playerId])).length > 0 ).map(m=>{
      let rosterUnits = m.rosterUnit.filter(y=>y.definitionId?.startsWith(baseId+':'))
      return Object.assign({},{
        player: m.name,
        playerId: m.playerId,
        allyCode: m.allyCode,
        baseId: baseId,
        relicTier: rosterUnits[0].relic?.currentTier,
        rarity: rosterUnits[0].currentRarity,
        level: rosterUnits[0].currentLevel,
        tier: rosterUnits[0].currentTier,
        gp: rosterUnits[0].gp,
        combatType: rosterUnits[0].combatType,
        sort: (rosterUnits[0].currentTier || 0) + (rosterUnits[0].relic?.currentTier || 0) + ((rosterUnits[0].gp || 0) / 100000000)
      })
    })
    */
    return members.filter(x=>x?.roster && x.roster[baseId] && (!playerUnitCount[x?.playerId] || maxUnit > playerUnitCount[x?.playerId])).map(m=>{
      //let rosterUnits = m.rosterUnit.filter(y=>y.definitionId?.startsWith(baseId+':'))
      return Object.assign({},{
        player: m.name,
        playerId: m.playerId,
        allyCode: m.allyCode,
        baseId: baseId,
        relicTier: m.roster[baseId].relicTier,
        rarity: m.roster[baseId].rarity,
        level: m.roster[baseId].level,
        tier: m.roster[baseId].gearTier,
        gp: m.roster[baseId].gp,
        combatType: m.roster[baseId].combatType,
        sort: m.roster[baseId].sort
      })
    })
  }catch(e){
    throw(e);
  }
}
