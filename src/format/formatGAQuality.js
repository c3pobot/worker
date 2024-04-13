'use strict'
const numeral = require('numeral')
module.exports = (pObj = {}, eObj = {}) => {
  let tempObj = {
    name: 'Quality',
    value: '```autohotkey\n'
  }
  tempObj.value += 'Mods       :: ' +numeral(pObj.quality.mods).format('0.00').padStart(10, ' ') + ' vs ' + numeral(eObj.quality.mods).format('0.00') + '\n'
  tempObj.value += 'Gear       :: ' +numeral(pObj.quality.gear).format('0.00').padStart(10, ' ') + ' vs ' + numeral(eObj.quality.gear).format('0.00') + '\n'
  tempObj.value += 'Total      :: ' +numeral(pObj.quality.mods + pObj.quality.gear).format('0.00').padStart(10, ' ') + ' vs ' + numeral(eObj.quality.mods + eObj.quality.gear).format('0.00') + '\n'
  tempObj.value += 'Top 80 mod :: ' +numeral(pObj.quality.top).format('0.00').padStart(10, ' ') + ' vs ' + numeral(eObj.quality.top).format('0.00') + '\n'
  tempObj.value += '```'
  return tempObj;
}
