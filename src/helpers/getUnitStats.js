'use strict'
const { calcCharStats, calcShipStats } = require('statcalc')
module.exports = (baseId, combatType, useValues)=>{
  if(!baseId) return
  if(combatType === 1) return calcCharStats({ baseId: baseId }, {useValues: useValues})
  if(combatType === 2) return calcShipStats({ baseId: baseId }, null, {useValues: useValues})
}
