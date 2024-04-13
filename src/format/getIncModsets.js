'use strict'
const getUnitName = require('src/helpers/getUnitName')
const sorter = require('json-array-sorter')
module.exports = (obj = {})=>{
  let tempObj = {
    name: 'Incomplete mod sets',
    value: '```autohotkey\n'
  }
  let unsortedArray = []
  if(gameData && gameData.modDefData && gameData.modSetData){
    for(let i in obj){
      if(obj[i].equippedStatMod.length > 1){
        let tempCount = {}
        for(let m in obj[i].equippedStatMod){
          if(gameData.modDefData[obj[i].equippedStatMod[m].definitionId] && +gameData.modDefData[obj[i].equippedStatMod[m].definitionId].setId){
            if(!tempCount[gameData.modDefData[obj[i].equippedStatMod[m].definitionId].setId]){
              tempCount[gameData.modDefData[obj[i].equippedStatMod[m].definitionId].setId] = {
                count: 0,
                setCount: +gameData.modSetData[gameData.modDefData[obj[i].equippedStatMod[m].definitionId].setId].count
              }
            }
            if(tempCount[gameData.modDefData[obj[i].equippedStatMod[m].definitionId].setId]) tempCount[gameData.modDefData[obj[i].equippedStatMod[m].definitionId].setId].count++
          }
        }
        let countTemp = 0
        for(let c in tempCount){
          if(+tempCount[c].setCount != +tempCount[c].count){
            if(+tempCount[c].setCount == 4) countTemp++;
            if(+tempCount[c].setCount == 2){
              if(+tempCount[c].count == 1 || +tempCount[c].count == 3 || +tempCount[c].count == 5) countTemp++;
            }
          }
        }
        if(countTemp > 0){
          let unitName = getUnitName(obj[i].definitionId.split(':')[0])
          unsortedArray.push({
            count: countTemp,
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
    for (let i in modsArray) tempObj.value += modsArray[i].unit + '\n'
  }else{
    tempObj.value += 'No units with incomplete modset\n'
  }
  tempObj.value += '```'
  return tempObj
}
