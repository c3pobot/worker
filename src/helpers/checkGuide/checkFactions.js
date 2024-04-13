'use strict'
const checkUnits = require('./checkUnits')
module.exports = async(factions = [], roster = [], foundUnits = [])=>{
  let res = []
  for(let i in factions){
    let req = JSON.parse(JSON.stringify(factions[i]))
    delete req.units
    let fUnits = factions[i].units?.map(x=>({...req,...{baseId: x}}))
    let units = checkUnits(fUnits, roster, req.combatType || 3, foundUnits, res)
    if(units?.length > 0){
      if(units?.filter(x=>x.notMet === 0).length >= req.numUnits){
        res = res.concat(units?.filter(x=>x.notMet === 0))
      }else{
        res = res.concat(units)
      }
    }
  }
  return res
}
