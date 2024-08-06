'use strict'
const mongo = require('mongoclient')
const zoneMap = require('./helper/zoneMap')
const squadStatusMap = {
  "SQUADAVAILABLE": "Loss",
  "SQUADDEFEATED": "Win"
}
const getButtons = require('./helper/getButtons')
const getSquads = require('./helper/getSquads')
const getBattles = require('./helper/getBattles')
const getMapStatus = require('./helper/getMapStatus')
const getChannelLogs = require('./helper/getChannelLogs')
const getHtml = require('webimg').tw

const { getDiscordAC, replyComponent, getImg } = require('src/helpers')
module.exports = async(obj = {}, opt = {})=>{
  if(obj.confirm?.response == 'no') return { content: 'command canceled...' }

  let dObj = await getDiscordAC(obj.member?.user?.id, opt)
  if(!dObj?.uId && !dObj?.type) return { content: 'You do not have your google account linked to your discordId' }

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
  if(!conflictStatus || !zoneChannelId) return { content: `Error get TW data, maybe a TW is not in progress` }

  let squads = await getSquads(conflictStatus)
  if(!squads || squads?.length == 0){
    await replyComponent(obj, { content: `Error getting battles for ${zoneMap[zoneId]?.nameKey}, maybe that zone is not open yet`, components: buttons }, method)
    return
  }
  let battleLog = await getChannelLogs(obj, dObj, zoneChannelId)
  if(battleLog) await mongo.set('tempCache', { _id: 'battleLog' }, { data: battleLog })
  if(battleLog === 'GETTING_CONFIRMATION') return;
  if(!battleLog?.event || battleLog?.event?.length == 0){
    await replyComponent(obj, { content: `Error getting battle log for ${zoneMap[zoneId]?.nameKey}`, components: buttons }, method)
    return
  }

  for(let i in squads) getBattles(battleLog.event, squads[i])
  squads = squads.filter(x=>x.log?.length > 0)
  if(squads?.length == 0){
    await replyComponent(obj, { content: `I could not find info for attackes in ${zoneMap[zoneId]?.nameKey} maybe no battles have happened yet`, components: buttons }, method)
    return
  }

  guild.zone = zoneMap[zoneId]?.nameKey
  let webHTML = getHtml.battleLog({squads: squads, profile: guild})
  if(!webHTML){
    await replyComponent(obj, { content: 'error getting html', components: buttons }, method)
    return
  }

  let webImg = await getImg(webHTML, obj.id, 650, false )
  if(!webImg){
    await replyComponent(obj, { content: 'error getting image', components: buttons }, method)
    return
  }

  await replyComponent(obj, { content: null, file: webImg, fileName: 'tw-attack-log.png', components: buttons }, method)
}
