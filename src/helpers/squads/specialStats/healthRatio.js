'use strict'
module.exports = (stats = {}, requirement = {}, res = {})=>{
  let protection = (stats.base['28'] || 0)
  let health = (stats.base['1'] || 0)
  if(stats.gear){
    protection += (stats.gear['28'] || 0) + (stats.mods['28'] || 0)
    health += (stats.gear['1'] || 0) + (stats.mods['1'] || 0)
  }
  if(stats.crew){
    protection += (stats.crew['28'] || 0)
    health += (stats.crew['1'] || 0)
  }
  res.stat = Number.parseFloat(protection / health)?.toFixed(2)
  if(res.stat < requirement.min) res.notMet = 1
  if(requirement.max && res.stat > requirement.max) res.notMet = 1
}
