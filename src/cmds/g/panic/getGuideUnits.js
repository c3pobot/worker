'use strict'
const mongo = require('mongoclient')

module.exports = async(guideTemplate = {})=>{
  let requiredUnits = [], optionalUnits = [], unitSet = new Set()
  if(guideTemplate.units?.length > 0){
    for(let i in guideTemplate.units){
      requiredUnits.push(guideTemplate.units[i].baseId)
      unitSet.add(guideTemplate.units[i].baseId)
    }
  }
  if(guideTemplate.groups?.length > 0){
    for(let i in guideTemplate.groups){
      if(guideTemplate.groups[i].units?.length > 0){
        for(let u in guideTemplate.groups[i].units){
          if(unitSet.has(guideTemplate.groups[i].units[u].baseId)) continue
          let req = { rarity: guideTemplate.groups[i].rarity, gp: guideTemplate.groups[i].gp, gear: guideTemplate.groups[i].gear }
          optionalUnits.push(guideTemplate.groups[i].units[u].baseId)
          unitSet.add(guideTemplate.groups[i].units[u].baseId)
        }
      }
    }
  }
  if(guideTemplate.factions?.length > 0){
    for(let i in guideTemplate.factions){
      let faction = (await mongo.find('factions', { _id: guideTemplate.factions[i].baseId }, { baseId: 1, units: 1 }))[0]
      if(!faction?.units || faction?.units?.length === 0) continue
      for(let u in faction.units){
        if(unitSet.has(faction.units[u])) continue
        optionalUnits.push(faction.units[u])
        unitSet.add(faction.units[u])
      }
    }
  }
  return { requiredUnits: requiredUnits, optionalUnits: optionalUnits }
}
