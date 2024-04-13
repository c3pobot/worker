'use strict'
const numeral = require('numeral')
module.exports = (gObj = {}, eObj = {})=>{
  let obj = {
    name: 'GP',
    value: '```autohotkey\nTotal : '+numeral(gObj.gp).format('0,0').padStart(12, ' ')
  }
  if(eObj) obj.value += ' vs '+numeral(eObj.gp).format('0,0');
  obj.value += '\nChar  : '+numeral(gObj.gpChar).format('0,0').padStart(12, ' ')
  if(eObj) obj.value += ' vs '+numeral(eObj.gpChar).format('0,0');
  obj.value += '\nShip  : '+numeral(gObj.gpShip).format('0,0').padStart(12, ' ')
  if(eObj) obj.value += ' vs '+numeral(eObj.gpShip).format('0,0')
  obj.value += '\n```'
  return obj
}
