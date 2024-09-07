'use strict'
const swgohClient = require('src/swgohClient')

module.exports = async(obj = {}, opt = {}, dObj = {}, missionId, zoneId)=>{
  let res = {}
  let gObj = await swgohClient.oauth(obj, 'guild', dObj, {})
  if(gObj === 'GETTING_CONFIRMATION') return gObj
  if(gObj?.error) return await replyTokenError(obj, dObj.allyCode, gObj.error)
  if(!gObj?.data?.guild) return { content: 'Error getting guild data' }

  gObj = gObj.data.guild
  if(!gObj?.territoryBattleStatus || gObj?.territoryBattleStatus.length === 0) return { content: 'tb not in progress'}
  let guildData = gObj.territoryBattleStatus[0]
  res.profile = gObj.profile
  res.member = gObj.member?.map(x=>{ return { id: x.playerId, name: x.playerName } })
  res.covert = guildData.covertZoneStatus?.find(x=>x.zoneStatus?.zoneId === missionId)
  if(!res.covert?.zoneStatus?.channelId) return { content: 'error finding special mission' }
  res.conflict = guildData.conflictZoneStatus?.find(x=>x?.zoneStatus?.zoneId === zoneId)?.zoneStatus
  if(!res.conflict?.channelId) return { content: 'error finding zone data' }

  let battleStats = await swgohClient.oauth(obj, 'getMapStats', dObj, { territoryMapId: guildData.instanceId })
  if(battleStats === 'GETTING_CONFIRMATION') return battleStats
  if(battleStats?.error) return await replyTokenError(obj, dObj.allyCode, gObj.error)
  if(!battleStats?.data?.currentStat) return { content: 'error getting battle stats'}

  let attempedStats = battleStats?.data?.currentStat?.find(x=>x.mapStatId === `covert_round_attempted_mission_${missionId}`)
  if(!attempedStats?.playerStat) return { content: 'error getting attempted special missions' }

  let completedStats = battleStats?.data?.currentStat?.find(x=>x.mapStatId === `covert_complete_mission_${missionId}`)
  if(!completedStats?.playerStat) return { content: 'error getting completed special missions' }

  res.attempt = attempedStats.playerStat?.map(x=>x.memberId)
  res.success = completedStats.playerStat?.map(x=>x.memberId)

  return res
}
