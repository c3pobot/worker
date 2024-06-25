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
  res.covert = guildData.covertZoneStatus?.find(x=>x.zoneStatus?.zoneId === missionId)
  if(!res.covert?.zoneStatus?.channelId) return { content: 'error finding special mission' }
  res.conflict = guildData.conflictZoneStatus?.find(x=>x?.zoneStatus?.zoneId === zoneId)?.zoneStatus
  if(!res.conflict?.channelId) return { content: 'error finding zone data' }

  let channelAuth = await swgohClient.oauth(obj, 'createGameChannelSession', dObj, {})
  if(channelAuth === 'GETTING_CONFIRMATION') return channelAuth
  if(!channelAuth?.data) return {error: 'Error getting Channel Session'}

  let identity = { androidId: dObj.uId, auth: channelAuth?.data, platform: 'Android', deviceId: dObj.uId }

  let mainLogs = await swgohClient.oauthPost('getChannelEvents', { eventCount: 10000, channelEventRequest: [{ channelId: res.conflict.channelId, limit: 10000 }]}, identity)
  if(!mainLogs?.event) return { content: 'Error getting main logs' }
  let missionLogs = await swgohClient.oauthPost('getChannelEvents', { eventCount: 10000, channelEventRequest: [{ channelId: res.covert?.zoneStatus?.channelId, limit: 10000 }]}, identity)
  if(!missionLogs.event) return { content: 'Error getting mission logs' }
  res.mainLogs = mainLogs.event?.filter(x=>x?.data && x?.data[0]?.payload?.zoneData?.activityLogMessage?.key === 'TERRITORY_CHANNEL_ACTIVITY_COVERT_COMPLETE')?.map(x=>x.authorId)
  res.missionLogs = missionLogs.event?.map(x=>{ return { name: x.authorName, id: x.authorId }})

  return res
}
