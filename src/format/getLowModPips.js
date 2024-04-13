'use strict'
const getUnitName = require('src/helpers/getUnitName')
const sorter = require('json-array-sorter')
module.exports = (obj = {})=>{
  let tempObj = {
    name: 'Mods < 5*',
    value: '```autohotkey\n'
  }
  let unsortedArray = []
  if(gameData && gameData.modDefData){
    for(let i in obj){
      if(obj[i].equippedStatMod.length > 0){
        let tempCount = 0
        for(let m in obj[i].equippedStatMod) if(gameData.modDefData[obj[i].equippedStatMod[m].definitionId] && +gameData.modDefData[obj[i].equippedStatMod[m].definitionId].rarity < 5) tempCount++;
        if(tempCount > 0){
          let unitName = getUnitName(obj[i].definitionId.split(':')[0])
          unsortedArray.push({
            count: tempCount,
            unit: (unitName || obj[i].definitionId.split(':')[0])
          })
        }
      }
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
    tempObj.value += 'No units with mod less than 5*\n'
  }
  tempObj.value += '```'
  return tempObj
}
