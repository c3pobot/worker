'use strict'
const mongo = require('mongoclient')
const numeral = require('numeral')
const getTimeTillEnd = (time)=>{
  let timeNow = (new Date()).getTime()
  if(timeNow < +time){
    let delta = Math.abs(+time - timeNow) / 1000
    let hours = Math.floor(delta / 3600)
    delta -= hours * 3600
    let minutes = Math.floor(delta / 60)
    delta -= minutes * 60
    let seconds = Math.floor(delta)
    return({
      h: hours > 9 ? hours.toString() : ('0'+hours).toString(),
      m: minutes > 9 ? minutes.toString() : ('0'+minutes).toString(),
      s: seconds > 9 ? seconds.toString() : ('0'+seconds).toString()
    })
  }else{
    return({
      h: '00',
      m: '00',
      s: '00'
    })
  }
}
const getTotalStarCount = (data, info)=>{
  let starCount = 0
  for(let i in data){
    let points = info.find(x=>x.zoneDefinition.zoneId === data[i].zoneStatus.zoneId).victoryPointRewards
    if(points){
      for(let p in points){
        if(+data[i].zoneStatus.score > +points[p].galacticScoreRequirement) starCount++
      }
    }
  }
  return starCount
}
module.exports = async(guildData)=>{
  let tbDef = (await mongo.find('tbDefinition', {_id: guildData.definitionId}))[0]
  let tempObj = {
    name: guildData.profile.name,
    guildId: guildData.profile.id,
    gp: +guildData.gp,
    gpChar: numeral(guildData.gpChar).format("0,0"),
    gpShip: numeral(guildData.gpShip).format("0,0"),
    currentRound: guildData.currentRound,
    currentRoundEndTime: guildData.currentRoundEndTime,
    timeTillEnd: GetTimeTillEnd(guildData.currentRoundEndTime),
    gpCharUndepoyed: guildData.gpChar,
    gpShipUndeployed: guildData.gpShip,
    totalStarCount: (GetTotalStarCount(guildData.conflictZoneStatus, tbDef.conflictZoneDefinition) || 0),
    zoneData:[]
  }
  return (JSON.parse(JSON.stringify(tempObj)))
}
