'use strict'
const getUnitName = require('src/helpers/getUnitName')
const sorter = require('json-array-sorter')
module.exports = async(obj = {})=>{
  let tempObj = {
    name: 'Units with 0 mods',
    value: '```autohotkey\n'
  }
  let noModCount = 0;
  let unsortedArray = []
  for(let i in obj){
    if(obj[i].equippedStatMod.length == 0 && obj[i].combatType == 1){
      noModCount++;
      if(obj[i].currentTier >= 12){
        let unitName = getUnitName(obj[i].definitionId.split(':')[0])
        unsortedArray.push({name: (unitName || obj[i].definitionId.split(':')[0])})
      }
    }
  }
  tempObj.name += ' ('+noModCount+')'
  if(unsortedArray.length > 0){
    tempObj.name +='\nUnits >G12 with no mods ('+unsortedArray.length+')'
    let sortedArray = sorter([{column: 'name', order: 'ascending'}], unsortedArray)
    let noModsArray = []
    if(sortedArray.length > 10){
      noModsArray = sortedArray.slice(0, 10)
    }else{
      noModsArray = sortedArray
    }
    for(let i in noModsArray) tempObj.value += noModsArray[i].name+'\n'
  }else{
    tempObj.value += 'No units with 0 mods\n'
  }
  tempObj.value += '```'
  return tempObj;
}
