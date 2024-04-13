'use strict'
const sorter = require('json-array-sorter')
module.exports = (obj = {}, value, combatType)=>{
  let unitGp = 0
  let rosterSorted = sorter([{column: 'gp', order: 'descending'}], obj)
  let tempObj = rosterSorted.filter(x=>x.combatType == combatType).slice(0, (value - 1))
  return tempObj.reduce((acc, a)=>{
    return acc + a.gp;
  }, 0)
}
