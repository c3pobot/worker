'use strict'
const numeral = require('numeral')
module.exports = (pObj = {}, eObj = {})=>{
  let tempObj = {
    name: 'Relics',
    value: '```autohotkey\n'
  }
  tempObj.value += "Total      :: " +numeral(pObj.rosterUnit.filter(r=>r.relic && r.relic.currentTier > 2 && r.combatType == 1).length).format('0,0').padStart(10, ' ') + " vs " + numeral(eObj.rosterUnit.filter(r=>r.relic && r.relic.currentTier > 2 && r.combatType == 1).length).format('0,0') + "\n";
  for (let i = 13; i > 6; i--) {
    let pRelic = pObj.rosterUnit.filter(r => r.relic && r.relic.currentTier == +i && r.combatType == 1).length
    let eRelic = eObj.rosterUnit.filter(r => r.relic && r.relic.currentTier == +i && r.combatType == 1).length
    if (+pRelic > 0 || +eRelic >0) tempObj.value += "R"+(+i - 2)+"         :: " +numeral(pRelic).format('0,0').padStart(10, ' ') + " vs " + numeral(eRelic).format('0,0') + "\n";
  }
  tempObj.value += "```";
  return tempObj
}
