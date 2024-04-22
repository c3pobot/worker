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

const { getDiscordAC, buttonPick, replyButton } = require('src/helpers')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'You do not have your google account linked to your discordId'}, method = 'PATCH'
  let loginConfirm = obj?.confirm?.response
  let zoneId = obj?.confirm?.zoneId
  if(obj?.confirm){
    await replyButton(obj, 'Here we go again ...')
    method = 'POST'
    if(loginConfirm === 'no') return { content: 'command canceled', components: []}
  }
  
  let dObj = await getDiscordAC(obj.member?.user?.id, opt)
  if(!dObj?.uId && !dObj?.type) return msg2send

  let mapStatus = await getMapStatus(obj, dObj, loginConfirm)
  if(mapStatus === 'GETTING_CONFIRMATION') return;
  if(!mapStatus?.territoryWarStatus || mapStatus?.territoryWarStatus?.length === 0) return {content: `Error get TW data`}

  let buttons = getButtons(obj, loginConfirm)
  if(!zoneId){
    msg2send.content = 'Please pick the zone below to check for preloaders'
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
  let squads = getSquads(conflictStatus)
  let battleLog, preload
  if(squads?.length > 0){
    msg2send.content = `Error getting battle log for ${zoneMap[zoneId]?.nameKey}`
    msg2send.components = buttons
    battleLog = await getChannelLogs(obj, dObj, loginConfirm, zoneChannelId)
    if(battleLog === 'GETTING_CONFIRMATION') return;
  }
  if(battleLog?.event?.length > 0){
    log.info(`BATTLE LOGS have ${battleLog.event.length} events...`)
    msg2send.content = `Error updaing battle log for ${zoneMap[zoneId]?.nameKey}`
    msg2send.components = buttons
    for(let i in squads) getBattles(battleLog.event, squads[i])
    preload = squads.filter(x=>x.preload === true)
    if(preload?.length == 0) msg2send.content = `I could not find info for preloaded squads in ${zoneMap[zoneId]?.nameKey} it may have been too long since the preload happened.`
  }
  if(preload?.length > 0){
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
    msg2send.content = null
    msg2send.embeds = [embedMsg]
    msg2send.components = buttons
  }
  await buttonPick(obj, msg2send, method)
}
