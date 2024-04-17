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
const GetHtml = require('webimg').tw
module.exports = async(obj = {}, opt = [])=>{
  try{
    let msg2send = {content: 'You do not have your google account linked to your discordId'}, loginConfirm, method = 'PATCH', zoneId
    let conflictStatus, squads, battleLog, zoneChannelId, guild, mapStatus, webHTML, webImg
    if(obj.confirm){
      await HP.ReplyButton(obj, 'Here we go again ...')
      if(obj?.confirm?.response) loginConfirm = obj.confirm.response
      if(obj?.confirm?.zoneId){
        zoneId = obj?.confirm.zoneId
        method = 'POST'
      }
    }
    if(loginConfirm === 'no'){
      await HP.ReplyMsg(obj, { content: 'command canceled', components: []})
      return;
    }
    let dObj = await HP.GetDiscordAC(obj.member?.user?.id, opt)
    if(!dObj?.uId && !dObj?.type){
      await HP.ReplyMsg(obj, msg2send)
      return;
    }
    if(dObj?.uId && dObj?.type){
      msg2send.content = 'Error getting tw map status'
      mapStatus = await getMapStatus(obj, dObj, loginConfirm)
      if(mapStatus === 'GETTING_CONFIRMATION') return;
    }

    let buttons = getButtons(obj, loginConfirm)
    if(!zoneId){
      msg2send.content = 'Please pick the zone below to check for attack log'
      msg2send.components = buttons
      await HP.ButtonPick(obj, msg2send)
      return
    }
    if(zoneId){
      msg2send.content = `Error get TW data, maybe a TW is not in progress`
      conflictStatus = mapStatus?.territoryWarStatus[0]?.awayGuild?.conflictStatus?.find(x=>x.zoneStatus?.zoneId === zoneId)
      let homeGuild = mapStatus?.territoryWarStatus[0]?.homeGuild?.conflictStatus?.find(x=>x.zoneStatus?.zoneId === zoneId)
      guild = mapStatus?.territoryWarStatus[0]?.homeGuild?.profile
      if(homeGuild?.zoneStatus?.channelId) zoneChannelId = homeGuild?.zoneStatus?.channelId
    }
    if(conflictStatus && zoneChannelId){
      msg2send.content = `Error getting battles for ${zoneMap[zoneId]?.nameKey}, maybe that zone is not open yet`
      msg2send.components = buttons
      squads = await getSquads(conflictStatus)
    }
    if(squads?.length > 0){
      msg2send.content = `Error getting battle log for ${zoneMap[zoneId]?.nameKey}`
      msg2send.components = buttons
      battleLog = await getChannelLogs(obj, dObj, loginConfirm, zoneChannelId)
      if(battleLog === 'GETTING_CONFIRMATION') return;
    }
    if(battleLog?.event?.length > 0){
      msg2send.content = `Error updaing battle log for ${zoneMap[zoneId]?.nameKey}`
      msg2send.components = buttons
      for(let i in squads) getBattles(battleLog.event, squads[i])
      squads = squads.filter(x=>x.log?.length > 0)
      if(squads?.length == 0) msg2send.content = `I could not find info for attackes in ${zoneMap[zoneId]?.nameKey} maybe no battles have happened yet`
    }
    if(squads?.length > 0){
      msg2send.content = 'error getting html'
      guild.zone = zoneMap[zoneId]?.nameKey
      webHTML = GetHtml.battleLog({squads: squads, profile: guild})
    }
    if(webHTML){
      msg2send.content = 'error getting image'
      webImg = await HP.GetImg(webHTML, obj.id, 650, false )
    }
    if(webImg){
      msg2send.content = null
      msg2send.file = webImg
      msg2send.fileName = 'tw-attack-log.png'
    }
    await HP.ButtonPick(obj, msg2send, method)
  }catch(e){
    console.error(e)
    HP.ReplyError(obj)
  }
}
