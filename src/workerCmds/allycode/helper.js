'use strict'
const mongo = require('mongoclient')
const Cmds = {}
Cmds.GetUnitCheck = async(roster)=>{
  try{
    let returnUnit, tempRoster
    if(roster.filter(x=>x.equippedStatMod.length == 0).length > 0) tempRoster = roster.filter(x=>x.equippedStatMod.length == 0)
    if(!tempRoster && roster.filter(x=>x.currentTier < 10 && x.equippedStatMod.length == 6).length > 0) tempRoster = roster.filter(x=>x.currentTier < 10 && x.equippedStatMod.length == 6)
    if(!tempRoster) tempRoster = roster.filter(x=>x.equippedStatMod.length == 6)
    if(tempRoster && tempRoster.length > 0){
      const randomIndex = Math.floor(Math.random() * ((+tempRoster.length - 1) - 0 + 1)) + 0
      if(tempRoster[randomIndex]) returnUnit = tempRoster[randomIndex]
    }
    return returnUnit
  }catch(e){
    throw(e)
  }
}
Cmds.VerifyUnit = async(playerId, roster)=>{
  try{
    let vObj = (await mongo.find('acVerify', {_id: playerId}))[0]
    if(!vObj) return
    let uObj = roster.find(x=>x.definitionId == vObj.defId)
    if(!uObj) return
    if(vObj.verify == 'add'){
      let count = 0
      if(uObj.equippedStatMod.length === 2){
        for(let i in uObj.equippedStatMod){
          if(uObj.equippedStatMod[i].primaryStat.stat.unitStatId === 48 || uObj.equippedStatMod[i].primaryStat.stat.unitStatId === 49) count++
        }
      }
      if(count === 2) return true
    }else{
      if(+vObj.mods.length - +uObj.equippedStatMod.length == 2) return true
    }
  }catch(e){
    throw(e)
  }
}
module.exports = Cmds
