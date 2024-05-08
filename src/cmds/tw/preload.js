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

const { getDiscordAC, replyComponent } = require('src/helpers')

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
    await replyComponent(obj, { content: 'Please pick the zone below to check for preloaders', components: buttons })
    return
  }

  let conflictStatus = mapStatus?.territoryWarStatus[0]?.awayGuild?.conflictStatus?.find(x=>x.zoneStatus?.zoneId === zoneId)
  let homeGuild = mapStatus?.territoryWarStatus[0]?.homeGuild?.conflictStatus?.find(x=>x.zoneStatus?.zoneId === zoneId)
  let guild = mapStatus?.territoryWarStatus[0]?.homeGuild?.profile
  let zoneChannelId = homeGuild?.zoneStatus?.channelId
  if(!conflictStatus || !zoneChannelId) return { content: `Error get TW data, maybe a TW is not in progress` }

  let squads = getSquads(conflictStatus)
  if(!squads || squads?.length == 0){
    await replyComponent(obj, { content: `Error getting battles for ${zoneMap[zoneId]?.nameKey}, maybe that zone is not open yet`, components: buttons }, method)
    return
  }
  let battleLog = await getChannelLogs(obj, dObj, zoneChannelId)
  if(battleLog === 'GETTING_CONFIRMATION') return;
  if(!battleLog?.event || battleLog?.event?.length == 0){
    await replyComponent(obj, { content: `Error getting battle log for ${zoneMap[zoneId]?.nameKey}`, components: buttons }, method)
    return
  }

  for(let i in squads) getBattles(battleLog.event, squads[i])
  let preload = squads.filter(x=>x.preload === true)
  if(!preload || preload?.length == 0){
    await replyComponent(obj, { content: `I could not find info for preloaded squads in ${zoneMap[zoneId]?.nameKey} it may have been too long since the preload happened.`, components: buttons }, method)
    return
  }

  let embedMsg = {
    color: 15844367,
    title: `${guild.name} preloaded squads for ${zoneMap[zoneId]?.nameKey}`,
    fields: []
  }
  for(let i in preload){
    let tempObj = {
      name: `${preload[i].playerName} ${preload[i].leader} squad (${preload[i].battleCount})`,
      value: `Battle Log :\n`
    }
    if(preload[i].log.length === 0) tempObj.value += 'I was not able to determine the battle log for this squad\n'
    if(preload[i].log?.filter(x=>x.playerPreloaded).length === 0) tempObj.value += 'I was not able to determine who preloaded this squad\n'
    for(let p in preload[i].log){
      let battleOutcome = squadStatusMap[preload[i].log[p]?.squadStatus]
      if(!battleOutcome) battleOutcome = 'Unknown'
      tempObj.value += `${preload[i].log[p].battleNum?.toString()?.padStart(2, 0)} ${preload[i].log[p].playerName} `
      if(preload[i].log[p]?.squadStatus === 'UNKNOWN'){
        tempObj.value += '- Unknown\n'
      }else{
        tempObj.value += ` (${preload[i].log[p]?.finishUnits}/${preload[i].log[p]?.startUnits}) - ${preload[i].log[p]?.playerPreloaded ? 'Preloaded':battleOutcome}\n`
      }

    }
    embedMsg.fields.push(tempObj)
  }
  await replyComponent(obj, { content: null, embeds: [embedMsg], components: buttons }, method)
}
