'use strict'
const getChar = require('./getChar')
const getShip = require('./getShip')
module.exports = (unit = {}, showName = true) =>{
  if(unit.combatType === 2) return getShip(unit, showName)
  return getChar(unit, showName)
}
