'use strict'
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

const { getDiscordAC, buttonPick, replyButton, getImg } = require('src/helpers')
module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'You do not have your google account linked to your discordId'}, loginConfirm, method = 'PATCH', zoneId
  let conflictStatus, squads, battleLog, zoneChannelId, guild, mapStatus, webHTML, webImg

  let loginConfirm = obj?.confirm?.response
  let zoneId = obj?.confirm?.zoneId
  if(obj?.confirm){
    await replyButton(obj, 'Here we go again ...')
    method = 'POST'
    if(loginConfirm === 'no') return { content: 'command canceled', components: []}
  }
  let dObj = await getDiscordAC(obj.member?.user?.id, opt)
  if(!dObj?.uId && !dObj?.type) return msg2send


  let conflictStatus, squads, battleLog, zoneChannelId, preload, guild, mapStatus

  let mapStatus = await getMapStatus(obj, dObj, loginConfirm)
  if(mapStatus === 'GETTING_CONFIRMATION') return;
  if(!mapStatus?.territoryWarStatus || mapStatus?.territoryWarStatus?.length === 0) return {content: `Error get TW data`}

  let buttons = getButtons(obj, loginConfirm)
  if(!zoneId){
    msg2send.content = 'Please pick the zone below to check for attack log'
    msg2send.components = buttons
    await buttonPick(obj, msg2send)
    return
  }
  let conflictStatus = mapStatus?.territoryWarStatus[0]?.awayGuild?.conflictStatus?.find(x=>x.zoneStatus?.zoneId === zoneId)
  let homeGuild = mapStatus?.territoryWarStatus[0]?.homeGuild?.conflictStatus?.find(x=>x.zoneStatus?.zoneId === zoneId)
  let guild = mapStatus?.territoryWarStatus[0]?.homeGuild?.profile
  let zoneChannelId = homeGuild?.zoneStatus?.channelId
  if(!conflictStatus || !zoneChannelId) return { content: `Error get TW data, maybe a TW is not in progress` }
  msg2send.content = `Error getting battles for ${zoneMap[zoneId]?.nameKey}, maybe that zone is not open yet`
  msg2send.components = buttons
  let squads = await getSquads(conflictStatus)

  if(squads?.length > 0){
    msg2send.content = `Error getting battle log for ${zoneMap[zoneId]?.nameKey}`
    msg2send.components = buttons
    battleLog = await getChannelLogs(obj, dObj, loginConfirm, zoneChannelId)
    if(battleLog === 'GETTING_CONFIRMATION') return;
  }
  if(battleLog?.event?.length > 0){
    log.info(`BATTLE LOGS have ${battleLog.event.length} events...`)
    msg2send.content = `Error updaing battle log for ${zoneMap[zoneId]?.nameKey}`
    for(let i in squads) getBattles(battleLog.event, squads[i])
    squads = squads.filter(x=>x.log?.length > 0)
    if(squads?.length == 0) msg2send.content = `I could not find info for attackes in ${zoneMap[zoneId]?.nameKey} maybe no battles have happened yet`
  }
  if(squads?.length > 0){
    msg2send.content = 'error getting html'
    guild.zone = zoneMap[zoneId]?.nameKey
    webHTML = getHtml.battleLog({squads: squads, profile: guild})
  }
  if(webHTML){
    msg2send.content = 'error getting image'
    webImg = await getImg(webHTML, obj.id, 650, false )
  }
  if(webImg){
    msg2send.content = null
    msg2send.file = webImg
    msg2send.components = buttons
    msg2send.fileName = 'tw-attack-log.png'
  }
  if(msg2send?.components?.length > 0){
    await buttonPick(obj, msg2send, method)
    return
  }
  return msg2send
}
