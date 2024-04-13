'use strict'
const calcRosterStats = require('./calcRosterStats')
module.exports = async(unit)=>{
  if(unit) return calcRosterStats([unit])
}
