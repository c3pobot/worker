'use strict'
const statCalc = require('statcalc')
module.exports.calcRosterStats = async(rosterUnit)=>{
  return await statCalc.calcRosterStats(rosterUnit)
}
module.exports.setGameData = statCalc.setGameData
