'use strict'
const sorter = require('json-array-sorter')
module.exports = (pObj = {}, eObj = {}) => {
  let obj = {
    player: [],
    enemy: []
  }
  let sortTemplate = [{ column: 'gp', order: 'descending' }]
  let pSorted = sorter(sortTemplate, pObj)
  let eSorted = sorter(sortTemplate, eObj)
  let pArray = pSorted;
  let eArray = eSorted;
  if (+pSorted.length > 20) pArray = pSorted.slice(0, 20);
  if (+eSorted.length > 20) eArray = eSorted.slice(0, 20);
  for (let i in pArray) {
    obj.player.push(pArray[i])
    obj.enemy.push(eObj.find(x => x.baseId == pArray[i].baseId))
  }
  if (pObj.length > 20) {
    let missingUnits = []
    for (let i = 0; i < 10; i++) {
      if (obj.player.filter(x => x.baseId == eArray[i].baseId).length == 0) {
        missingUnits.push(eArray[i].baseId)
      }
    }
    if (+missingUnits.length > 0) {
      obj.player.splice(-(+missingUnits.length))
      obj.enemy.splice(-(+missingUnits.length))
      for (let i in missingUnits) {
        obj.player.push(pObj.find(x => x.baseId == missingUnits[i]))
        obj.enemy.push(eObj.find(x => x.baseId == missingUnits[i]))
      }
    }
  }
  return obj
}
