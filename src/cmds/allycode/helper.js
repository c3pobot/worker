'use strict'
const mongo = require('mongoclient')
const Cmds = {}
Cmds.getUnitCheck = (roster = [])=>{
  let returnUnit, tempRoster
  if(roster.filter(x=>x.equippedStatMod.length == 0).length > 0) tempRoster = roster.filter(x=>x.equippedStatMod.length == 0)
  if(!tempRoster && roster.filter(x=>x.currentTier < 10 && x.equippedStatMod.length == 6).length > 0) tempRoster = roster.filter(x=>x.currentTier < 10 && x.equippedStatMod.length == 6)
  if(!tempRoster) tempRoster = roster.filter(x=>x.equippedStatMod.length == 6)
  if(tempRoster && tempRoster.length > 0){
    let randomIndex = Math.floor(Math.random() * ((+tempRoster.length - 1) - 0 + 1)) + 0
    if(tempRoster[randomIndex]) returnUnit = tempRoster[randomIndex]
  }
  return returnUnit
}
Cmds.verifyUnit = async(playerId, roster = [])=>{
  let auth = 0
  let vObj = (await mongo.find('acVerify', {_id: playerId}))[0]
  if(!vObj) return
  let uObj = roster.find(x=>x.definitionId == vObj.defId)
  if(!uObj) return
  if(vObj.verify == 'add'){
    if(uObj.equippedStatMod.length == 2){
      for(let i in uObj.equippedStatMod){
        if(uObj.equippedStatMod[i].primaryStat.stat.unitStatId === 48 || uObj.equippedStatMod[i].primaryStat.stat.unitStatId === 49) auth++
      }
    }
  }else{
    if(+vObj.mods.length - +uObj.equippedStatMod.length === 2) auth = 2
  }
  return auth
}
module.exports = Cmds
