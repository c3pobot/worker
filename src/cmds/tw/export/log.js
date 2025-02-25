'use strict'
const swgohClient = require('src/swgohClient')
const { getDiscordAC, replyTokenError, replyComponent } = require('src/helpers')
const getButtons = require('src/cmds/tw/helper/getButtons')
const getChannelLogs = require('src/cmds/tw/helper/getChannelLogs')
const getMapStatus = require('src/cmds/tw/helper/getMapStatus')
const zoneMap = require('src/cmds/tw/helper/zoneMap')

module.exports = async(obj = {}, opt = {})=>{
  if(obj.confirm?.response == 'no') return { content: 'command canceled...'}

  let dObj = await getDiscordAC(obj.member.user.id, opt)
  if(!dObj?.uId || !dObj?.type) return { content: 'You do not have your google account linked to your discordId' }

  let mapStatus = await getMapStatus(obj, dObj)
  if(mapStatus === 'GETTING_CONFIRMATION') return;
  if(!mapStatus?.territoryWarStatus || mapStatus?.territoryWarStatus?.length === 0) return { content: `Error get TW data` }

  let zoneId = obj.confirm?.zoneId, buttons = getButtons(obj), method = 'PATCH'
  if(zoneId) method = 'POST'
  if(!zoneId){
    await replyComponent(obj, { content: 'Please pick the zone below to check for attack log', components: buttons })
    return
  }

  let conflictStatus = mapStatus?.territoryWarStatus[0]?.awayGuild?.conflictStatus?.find(x=>x.zoneStatus?.zoneId === zoneId)
  let homeGuild = mapStatus?.territoryWarStatus[0]?.homeGuild?.conflictStatus?.find(x=>x.zoneStatus?.zoneId === zoneId)
  let guild = mapStatus?.territoryWarStatus[0]?.homeGuild?.profile
  let zoneChannelId = homeGuild?.zoneStatus?.channelId
  let memberSet = new Set(mapStatus?.territoryWarStatus[0]?.optedInMember?.map(x=>x.memberId) || [])
  if(!conflictStatus || !zoneChannelId) return { content: `Error get TW data, maybe a TW is not in progress` }

  let battleLog = await getChannelLogs(obj, dObj, zoneChannelId)
  if(battleLog === 'GETTING_CONFIRMATION') return;
  if(!battleLog?.event || battleLog?.event?.length == 0){
    await replyComponent(obj, { content: `Error getting battle log for ${zoneMap[zoneId]?.nameKey}`, components: buttons }, method)
    return
  }

  let events = []
  for(let i in battleLog.event){
    if(!memberSet.has(battleLog.event[i]?.authorId)) continue
    if(battleLog.event[i].data[0]?.payload?.zoneData?.activityLogMessage?.key === 'TERRITORY_CHANNEL_ACTIVITY_CONFLICT_DEFENSE_DEPLOY') continue
    delete battleLog.event[i].channelId
    events.push(battleLog.event[i])
  }
  if(!events || events?.length == 0){
    await replyComponent(obj, { content: `Error getting battles for ${zoneMap[zoneId]?.nameKey}, maybe that zone is not open yet`, components: buttons }, method)
    return
  }

  battleLog.event = events
  let data = Buffer.from(JSON.stringify(battleLog))
  await replyComponent(obj, { content: 'TW-logs attached', file: data, fileName: `${guild?.id}-tw-log-${zoneMap[zoneId]?.nameKey}.json`, components: buttons })
}
