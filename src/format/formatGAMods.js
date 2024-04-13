'use strict'
const numeral = require('numeral')
const calcMods = require('./calcMods')
module.exports = (pObj = {}, eObj = {})=>{
  let tempObj = {
    name: 'Mods',
    value: '```autohotkey\n'
  }
  tempObj.value += "R6 mods    :: " +numeral(pObj.sixModCount).format('0,0').padStart(10, ' ') + " vs " + numeral(eObj.sixModCount).format('0,0') + "\n";
  tempObj.value += "Mods +10   :: " +numeral(calcMods(pObj.rosterUnit, 9, 15)).format('0,0').padStart(10, ' ') + " vs " + numeral(calcMods(eObj.rosterUnit, 9, 15)).format('0,0') + "\n";
  tempObj.value += "Mods +15   :: " +numeral(calcMods(pObj.rosterUnit, 14, 20)).format('0,0').padStart(10, ' ') + " vs " + numeral(calcMods(eObj.rosterUnit, 14, 20)).format('0,0') + "\n";
  tempObj.value += "Mods +20   :: " +numeral(calcMods(pObj.rosterUnit, 19, 25)).format('0,0').padStart(10, ' ') + " vs " + numeral(calcMods(eObj.rosterUnit, 19, 25)).format('0,0') + "\n";
  tempObj.value += "Mods +25   :: " +numeral(calcMods(pObj.rosterUnit, 24, 999)).format('0,0').padStart(10, ' ') + " vs " + numeral(calcMods(eObj.rosterUnit, 24, 999)).format('0,0') + "\n";
  tempObj.value += "```";
  return tempObj
}
