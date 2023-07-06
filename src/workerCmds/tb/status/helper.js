'use strict'
const swgohClient = require('swgohClient')
const getPlatoonScore = (platoon = [], platoonDefinition)=>{
  try{
    let count = 0, i = platoon.length
    while(i--){
      let numSquads = 0, squadsFilled = 0, s = platoon[i].squad.length
      while(s--){
        numSquads += +platoon[i].squad[s].unit.length
        squadsFilled += +platoon[i].squad[s].unit.filter(x=>x.memberId !== "").length
      }
      if(numSquads === squadsFilled && numSquads > 0){
        count += +platoonDefinition[platoon[i].id].score || 0
      }
    }
    return count
  }catch(e){
    throw(e)
  }
}
const getStarData = (victoryPointRewards = [], score)=>{
  try{
    let res = { current: 0 }, i = victoryPointRewards.length
    for(let i in victoryPointRewards){
      if(+score >= +victoryPointRewards[i].score){
        res.current++
      }else{
        res[+i + 1] = +victoryPointRewards[i].score - +score
      }
    }
    return res
  }catch(e){
    throw(e)
  }
}
module.exports.getMapStats = async(obj = {}, dObj = {}, statDef = {}, instanceId)=>{
  try{
    let getMapStats = await swgohClient('getMapStats', { territoryMapId: instanceId }, dObj, obj)
    let currentStat = getMapStats?.data?.currentStat
    if(!currentStat) return
    let res = {}, i = currentStat.length
    while(i--){
      res[currentStat[i].mapStatId] = { mapStatId: currentStat[i].mapStatId, total: 0, nameKey: statDef[currentStat[i].mapStatId] || currentStat[i].mapStatId, playerStat: {} }
      let s = currentStat[i].playerStat.length
      while(s--){
        let score = currentStat[i].playerStat[s].score || 0
        res[currentStat[i].mapStatId].total += +score
        res[currentStat[i].mapStatId].playerStat[currentStat[i].playerStat[s].memberId] = { memberId: currentStat[i].playerStat[s].memberId, score: +score }
      }
    }
    return res
  }catch(e){
    throw(e)
  }
}
module.exports.getZoneStatus = (zoneStatus = [], zoneDefinition = {}, zone )=>{
  try{
    let res = {}, i = zoneStatus.length
    while(i--){
      let tempDef = zoneDefinition[zoneStatus[i].zoneStatus.zoneId]
      if(!tempDef) return
      tempDef = {...tempDef, ...zoneStatus[i].zoneStatus}
      if(zoneStatus[i].playersParticipated >= 0) tempDef.playersParticipated = zoneStatus[i].playersParticipated
      if(zoneStatus[i].successfulAttempts >= 0) tempDef.successfulAttempts = zoneStatus[i].successfulAttempts
      if(zoneStatus[i].platoon) tempDef.score = getPlatoonScore(zoneStatus[i].platoon, tempDef.platoonDefinition)
      if(tempDef.victoryPointRewards) tempDef.star = getStarData(tempDef.victoryPointRewards, tempDef.score)
      res[tempDef.zoneId] = tempDef
    }
    return res
  }catch(e){
    throw(e)
  }
}
module.exports.getStarCount = (zone = [], zoneDefinition)=>{
  try{
    let count = 0, i = zone.length
    while(i--){
      let zoneDef = zoneDefinition[zone[i].zoneStatus.zoneId]
      if(!zoneDef) return
      let s = zoneDef.victoryPointRewards.length
      while(s--){
        if(+zone[i].zoneStatus.score >= +zoneDef.victoryPointRewards[s].score) count++
      }
    }
    return count
  }catch(e){
    throw(e)
  }
}
module.exports.getGp = (zone = {}, currentStat = {}, member = [])=>{
  try{
    let res = {showTotalGp: false, guild: {total: 0, ship: 0, char: 0}, deployed: { total: 0, ship: 0, char: 0}}
    let i = member.length
    while(i--){
      res.guild.total += +member[i].galacticPower || 0, res.guild.ship += +member[i].shipGalacticPower || 0, res.guild.char += +member[i].characterGalacticPower
    }
    for(let i in zone){
      if(zone[i].unitType === 3) res.showTotalGp = true
      let stat = currentStat['power_zone_'+i]
      if(!stat) continue
      if(zone[i].unitType === 3) res.deployed.total += +stat.total || 0
      if(zone[i].unitType === 2) res.deployed.ship += +stat.total || 0
      if(zone[i].unitType === 1) res.deployed.char += +stat.total || 0
    }
    return res
  }catch(e){
    throw(e)
  }
}
