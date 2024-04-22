'use strict'
const twStats = require('./helper')
const getHtml = require('webimg').tw

const { getDiscordAC, replyButton, replyTokenError, getImg } = require('src/helpers')
const swgohClient = require('src/swgohClient')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'You do not have your google account linked to your discordId'}
  if(obj.confirm) await replyButton(obj, 'Pulling guild data ...')
  let loginConfirm = obj.confirm?.response
  let dObj = await getDiscordAC(obj.member.user.id, opt)
  if(!dObj?.uId || !dObj?.type) return msg2send

  let gObj = await swgohClient.oauth(obj, 'guild', dObj, {}, loginConfirm)
  if(gObj === 'GETTING_CONFIRMATION') return
  if(gObj?.error == 'invalid_grant'){
    await replyTokenError(obj, dObj.allyCode)
    return;
  }
  if(gObj?.msg2send) return { content: gObj.msg2send }
  if(!gObj?.data?.guild) return { content: 'Error getting guild data...'}

  if(!gObj?.data?.guild?.territoryWarStatus || gObj?.data?.guild?.territoryWarStatus?.length === 0) return { content: 'There is not a TW in progress'}
  if(!gObj.data.guild.territoryWarStatus[0].awayGuild) return { content: 'There is not a TW in progress'}

  let guildData = gObj.data.guild.territoryWarStatus[0]
  let battleStats = await swgohClient.oauth(obj, 'getMapStats', dObj, {territoryMapId: guildData?.instanceId}, loginConfirm)
  if(!battleStats?.data?.currentStat) return { content: 'Error getting battle stats' }
  if(battleStats === 'GETTING_CONFIRMATION') return
  if(battleStats?.error == 'invalid_grant'){
    await replyTokenError(obj, dObj.allyCode)
    return;
  }
  if(battleStats?.msg2send) return { content: battleStats.msg2send }

  guildData.currentStat = battleStats.data.currentStat
  guildData.instanceInfo = gObj.data.guild.guildEvents.find(x=>x.id == guildData.instanceId.split(':')[0])
  let webData = twStats(guildData, gObj.data.guild.profile.id)
  if(!webData) return { content: 'Error calculating stats...'}

  let webHTML = await getHtml.status(webData)
  if(!webHTML) return { content: 'error getting html'}

  let webImg = await getImg(webHTML, obj.id, 1240, false)
  if(!webImg) return { content: 'Error getting image'}

  msg2send.content = null
  msg2send.file = webImg
  msg2send.fileName = 'twstatus.png'
  return msg2send
}
