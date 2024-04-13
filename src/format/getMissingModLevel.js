'use strict'
const getUnitName = require('src/helpers/getUnitName')
const sorter = require('json-array-sorter')
module.exports = (obj = {})=>{
  let tempObj = {
    name: 'Mods < L15',
    value: '```autohotkey\n'
  }
  let unsortedArray = []
  for(let i in obj){
    if(obj[i].equippedStatMod.length > 0 && obj[i].equippedStatMod.filter(x=>x.level == 15).length != obj[i].equippedStatMod.length){
      let unitName = getUnitName(obj[i].definitionId.split(':')[0])
      unsortedArray.push({
        count: +obj[i].equippedStatMod.filter(x=>x.level < 15).length,
        unit: (unitName || obj[i].definitionId.split(':')[0])
      })
    }
  }
  tempObj.name += ' ('+unsortedArray.length+')'
  if(unsortedArray.length > 0){
    let sortedArray = sorter([{ column: 'count', order: 'descending' }], unsortedArray)
    let modsArray = sortedArray
    if (sortedArray.length > 15) {
      modsArray = sortedArray.slice(0, 15)
    }
    for (let i in modsArray) tempObj.value += modsArray[i].count+' : '+modsArray[i].unit+'\n'
  }else{
    tempObj.value += 'No units with mod levels less than 15\n'
  }
  tempObj.value += '```'
  return tempObj
}
