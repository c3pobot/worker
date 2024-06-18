'use strict'
const { dataList } = require('../dataList')
const formatWebUnit = require('src/format/formatWebUnit')
const addRequirement = async(obj = {}, type, value)=>{
  if(type && value){
    if(!obj.requirement){
      obj.requirement = type+''+value
    }else{
      obj.requirement += '<br>'+type+''+value
    }
  }
}
module.exports = (units = [], roster = [], combatType = 3, foundUnits = [], foundFactionUnits = [])=>{
  let res = []
  for(let i in units){
    let uInfo = dataList?.unitList[units[i].baseId]
    if(foundUnits.filter(x=>x.baseId === units[i].baseId).length == 0 && foundFactionUnits.filter(x=>x.baseId === units[i].baseId).length === 0){
      if(uInfo.name && (combatType === 3 || uInfo?.combatType === combatType)){
        let pUnit = roster.find(x=>x.definitionId.startsWith(uInfo.baseId+':'))
        let tempObj = formatWebUnit(pUnit, uInfo)
        if(tempObj){
          tempObj.notMet = 0
          tempObj.equipment = pUnit?.equipment
          if(units[i].rarity > 1) tempObj.reqRarity = +units[i].rarity
          if(units[i].gp) tempObj.reqGP = +units[i].gp
          if(uInfo.combatType === 1 && units[i]?.gear?.value > 1){
            if(units[i].gear.name == 'gear') tempObj.reqGear = +units[i].gear.value
            if(units[i].gear.name == 'relic') tempObj.reqRelic = +units[i].gear.value
          }
          if(tempObj.reqRarity){
            if(tempObj.rarity < tempObj.reqRarity){
              tempObj.notMet++
            }else{
              tempObj.rarityMet = true
            }
          }
          if(tempObj.reqGear && tempObj.gear < tempObj.reqGear) tempObj.notMet++
          if(tempObj.reqRelic && tempObj.relic < tempObj.reqRelic) tempObj.notMet++
          if(tempObj.reqRarity && tempObj.reqRarity > 1) addRequirement(tempObj, tempObj.reqRarity.toString(), '*')
          if(tempObj.reqRelic){
            addRequirement(tempObj, 'R', (+tempObj.reqRelic - 2).toString())
          }else{
            if(tempObj.reqGear) addRequirement(tempObj, 'G', tempObj.reqGear.toString())
          }
          res.push(tempObj)
        }
      }
    }
  }
  return res
}
