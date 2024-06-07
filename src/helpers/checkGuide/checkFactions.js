'use strict'
const mongo = require('mongoclient')
const checkUnits = require('./checkUnits')

module.exports = async(factions = [], roster = [], foundUnits = [])=>{
  let res = []
  for(let i in factions){
    let faction = (await mongo.find('factions', { _id: factions[i].baseId }))[0]
    if(!faction?.units || faction?.units?.length === 0) continue
    let factionUnits = faction.units?.map(x=>{ return { baseId: x } })

    let req = JSON.parse(JSON.stringify(factions[i]))
    delete req.units
    let units = checkUnits(factionUnits, roster, req.combatType || 3, foundUnits, res)

    if(units?.length > 0){
      if(req.numUnits && units?.filter(x=>x.notMet === 0).length >= req.numUnits){
        res = res.concat(units?.filter(x=>x.notMet === 0))
      }else{
        res = res.concat(units)
      }
    }
  }
  return res
}
