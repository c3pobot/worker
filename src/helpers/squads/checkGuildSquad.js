'use strict'
const sorter = require('json-array-sorter')
const { pct } = require('../enum')
module.exports = (units, players)=>{
  let tempObj = {}
  for(let i in units){
    if(!tempObj[units[i].baseId]) tempObj[units[i].baseId] = []
    let guildUnits = players.filter(x=>x.rosterUnit.some(u=>u.definitionId.startsWith(units[i].baseId+':') && u.currentRarity >= units[i].rarity)).map(p=>{
      return Object.assign({}, {
        name: p.name,
        rarity: (p.rosterUnit.find(y=>y.definitionId.startsWith(units[i].baseId+':')).currentRarity || 1),
        combatType: (p.rosterUnit.find(y=>y.definitionId.startsWith(units[i].baseId+':')).combatType || 1),
        gear: (p.rosterUnit.find(y=>y.definitionId.startsWith(units[i].baseId+':')).currentTier || 0),
        gp: (p.rosterUnit.find(y=>y.definitionId.startsWith(units[i].baseId+':')).gp || 0),
        relic: (p.rosterUnit.find(y=>y.definitionId.startsWith(units[i].baseId+':')).relic ? p.rosterUnit.find(y=>y.definitionId.startsWith(units[i].baseId+':')).relic.currentTier:0),
        stats: p.rosterUnit.find(y=>y.definitionId.startsWith(units[i].baseId+':')).stats
      })
    })
    guildUnits = sorter([{column: 'name', order: 'ascending'}], guildUnits)
    if(units[i].combatType == 1 && units[i].gear && units[i].gear.name == 'gear' && units[i].gear.value > 0) guildUnits = guildUnits.filter(x=>x.gear >= units[i].gear.value)
    if(units[i].combatType == 1 && units[i].gear && units[i].gear.name == 'relic') guildUnits = guildUnits.filter(x=>x.relic >= units[i].gear.value)
    if(units[i].gp) guildUnits = guildUnits.filter(x=>x.gp >= +units[i].gp)
    if(units[i].stats && units[i].stats.length > 0){
      guildUnits = guildUnits.filter(x=>x.stats)
      for(let s in units[i].stats){
        if(pct[units[i].stats[s].id]) units[i].stats[s].min = +units[i].stats[s].min / 100
        if(pct[units[i].stats[s].id] && units[i].stats[s].max) units[i].stats[s].max = +units[i].stats[s].max / 100
        guildUnits = guildUnits.filter(x=>+x.stats[units[i].stats[s].id] >= +units[i].stats[s].min)
      }
    }
    if(tempObj[units[i].baseId]) tempObj[units[i].baseId] = guildUnits.map(p=>p.name)
  }
  const tempPlayers = Object.values(tempObj)
  let finalArray = tempPlayers[0]
  if(tempPlayers.length > 1){
    for(let i=1;i<tempPlayers.length;i++) finalArray = finalArray.filter(x=>tempPlayers[i].includes(x))
  }
  return finalArray
}
