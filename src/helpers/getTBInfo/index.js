'use strict'
const tbStats = require('./tbStats')
const mongo = require('mongoclient')

module.exports = async(gObj, battleStats)=>{
  let tbObj
  let guildData = JSON.parse(JSON.stringify(gObj.territoryBattleStatus[0]))
  let memberGp = { gpChar: 0, gpShip : 0 }
  let member = gObj.member.map(m=>{
    memberGp.gpChar += +(m.characterGalacticPower || 0)
    memberGp.gpShip += +(m.shipGalacticPower || 0)
    return { name: m.playerName, gp: +(m.galacticPower || 0), gpChar: +(m.characterGalacticPower || 0), gpShip: +(m.shipGalacticPower || 0), playerId: m.playerId }
  })
  guildData.profile = gObj.profile
  guildData.gp = +gObj?.profile?.guildGalacticPower || 0
  guildData.gpChar = memberGp.gpChar || 0
  guildData.gpShip = memberGp.gpShip || 0
  guildData.member = member
  guildData.currentStat = battleStats.currentStat
  await mongo.set('tbCache', {_id: gObj.profile.id}, guildData)
  let tempObj = await tbStats(gObj.profile.id, guildData)
  if(tempObj?.data && tempObj?.status == 'ok') await mongo.set('tbCache', {_id: gObj.profile.id}, tempObj.data)
  return tempObj
}
