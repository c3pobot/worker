'use strict'
const mongo = require('mongoclient')
const twStats = require('./helper/twStats')
const getHtml = require('webimg').tw

const { getDiscordAC, getImg, replyTokenError } = require('src/helpers')
const swgohClient = require('src/swgohClient')

module.exports = async(obj = {}, opt = {})=>{
  if(obj.confirm?.response == 'no') return { content: 'command canceled...'}

  let dObj = await getDiscordAC(obj.member.user.id, opt)
  if(!dObj?.uId || !dObj?.type) return { content: 'You do not have your google account linked to your discordId' }

  let gObj = await swgohClient.oauth(obj, 'guild', dObj, {})
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
  let battleStats = await swgohClient.oauth(obj, 'getMapStats', dObj, {territoryMapId: guildData?.instanceId})
  if(battleStats === 'GETTING_CONFIRMATION') return
  if(battleStats?.error == 'invalid_grant'){
    await replyTokenError(obj, dObj.allyCode)
    return;
  }
  if(battleStats?.msg2send) return { content: battleStats.msg2send }
  if(!battleStats?.data?.currentStat) return { content: 'error getting stats' }

  guildData.currentStat = battleStats.data.currentStat
  guildData.instanceInfo = gObj.data.guild.guildEvents.find(x=>x.id == guildData.instanceId.split(':')[0])
  await mongo.set('tempCache', { _id: 'twStatus' }, { data: guildData })
  let webData = twStats(guildData, gObj.data.guild.profile.id)
  if(!webData) return { content: 'Error calculating stats...'}

  let webHTML = await getHtml.status(webData)
  if(!webHTML) return { content: 'error getting html'}

  let webImg = await getImg(webHTML, obj.id, 1240, false)
  if(!webImg) return { content: 'Error getting image'}

  return { content: null, file: webImg, fileName: 'twstatus.png' }
}
