'use strict'
const sorter = require('json-array-sorter')
const numeral = require('numeral')
const newObj = require('./newTWObj')
const enumTW = require('./enumTWZones')
const homeGuild = require('./homeGuild')
const awayGuild = require('./awayGuild')
const getTimeTillEnd = require('./timeTillEnd')
const adjustPerfectScore = (obj, guild)=>{
  const opponent = (guild == 'home' ? 'away' : 'home')
  return obj.banners[guild].perfectScore - (enumTW.scores.p1.perCharSquadMax * +obj.drops[guild].charNotSet) - (enumTW.scores.p1.perShipSquadMax * +obj.drops[guild].shipNotSet) - (enumTW.scores.p1.perShipDefSet * +obj.drops[opponent].shipNotSet) - (enumTW.scores.p1.perCharDefSet * +obj.drops[opponent].charNotSet)
}
const calcUnitDrops = (obj, guild)=>{
  if(obj.banners[guild].clear > 0){
    return( obj.banners[guild].perfectScore - obj.banners[guild].finalScore - obj.drops[guild].charBannerDrops -  obj.drops[guild].shipBannerDrops)
  }else{
    let maxScore = obj.banners[guild].perfectScore
    for(let i in obj.zoneData[guild].data){
      if(obj.zoneData[guild].data[i].totalSquads > obj.zoneData[guild].data[i].defeatedSquads){
        //remove clear bonus
        maxScore -= ( enumTW.scores.p1.clearPerSquadBonus *  obj.zoneData[guild].data[i].totalSquads)
        if(obj.zoneData[guild].data[i].nameKey !== "S2" && obj.zoneData[guild].data[i].nameKey !== "M2" && obj.zoneData[guild].data[i].nameKey !== "B4"){
          maxScore -= enumTW.scores.p1.clearBonus
        }else{
          maxScore -= enumTW.scores.p4.clearBonus
        }
        //remove undefeated squads
        if(obj.zoneData[guild].data[i].combatType === 1){
          maxScore -= ( enumTW.scores.p1.perCharSquadMax *  ( obj.zoneData[guild].data[i].totalSquads - obj.zoneData[guild].data[i].defeatedSquads ) )
        }else{
          maxScore -= ( enumTW.scores.p1.perShipSquadMax *  ( obj.zoneData[guild].data[i].totalSquads - obj.zoneData[guild].data[i].defeatedSquads ) )
        }
      }
    }
    return ( maxScore - obj.banners[guild].finalScore - obj.drops[guild].charBannerDrops -  obj.drops[guild].shipBannerDrops)
  }
}
const getMaxBattles = (obj)=>{
  return (obj.conflictStatus.reduce((acc, a)=>{
    return acc + a.squadCapacity
  },0))
}
module.exports = (guildData, guildId)=>{
  let twData = newObj(guildData)
  homeGuild(twData)
  awayGuild(twData)
  twData.joined = guildData.optedInMember?.map(m => {
    return Object.assign({}, {
      playerId: m.memberId,
      gp: m.power
    })
  })
  twData.currentStat = guildData.currentStat
  twData.leaders.home = sorter([{order:"descending", column: "defends"}], twData.leaders.home)
  twData.leaders.away = sorter([{order:"descending", column: "defends"}], twData.leaders.away)
  twData.drops.home.units = calcUnitDrops(twData, "home")
  twData.drops.away.units = calcUnitDrops(twData, "away")
  twData.timeTillEnd = getTimeTillEnd(guildData.instanceInfo.instance.find(x=>x.id === guildData.instanceId.split(':')[1]).endTime)
  twData.maxBattles = getMaxBattles(guildData.homeGuild)
  twData.banners.home.perfectScore = adjustPerfectScore(twData, 'home')
  twData.banners.away.perfectScore = adjustPerfectScore(twData, 'away')
  twData.banners.home.finalScore = numeral(twData.banners.home.finalScore).format("0,0")
  twData.banners.away.finalScore = numeral(twData.banners.away.finalScore).format("0,0")
  twData.banners.home.bestScore = numeral(twData.banners.home.bestScore).format("0,0")
  twData.banners.away.bestScore = numeral(twData.banners.away.bestScore).format("0,0")
  twData.banners.perfectScore = numeral(twData.banners.perfectScore).format("0,0")
  twData.banners.home.perfectScore = numeral(twData.banners.home.perfectScore).format('0,0')
  twData.banners.away.perfectScore = numeral(twData.banners.away.perfectScore).format('0,0')
  return twData
  /*
  if(status == 'ok'){
    await mongo.set('twStatusCache', {_id: guildId}, twData)

  }
  */
}
