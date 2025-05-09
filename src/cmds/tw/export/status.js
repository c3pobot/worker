'use strict'
const swgohClient = require('src/swgohClient')
const { getDiscordAC, replyTokenError, replyMsg } = require('src/helpers')

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
  //if(!gObj.data.guild.territoryWarStatus[0].awayGuild) return { content: 'There is not a TW in progress'}

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

  let endTime = guildData.instanceInfo?.instance[0]?.endTime, showHomeDefense = false
  if(Date.now() > endTime) showHomeDefense = true
  for(let i in guildData?.homeGuild?.conflictStatus){
    guildData.homeGuild.conflictStatus[i].zoneStatus.channelId = null
    if(!showHomeDefense){
      guildData.homeGuild.conflictStatus[i].warSquad = []
      guildData.homeGuild.conflictStatus[i].zoneStatus.commandMessage = null
    }
  }
  if(guildData?.awayGuild){
    for(let i in guildData?.awayGuild?.conflictStatus) guildData.awayGuild.conflictStatus[i].zoneStatus.channelId = null
  }
  //if(!showHomeDefense) guildData.optedInMember = []
  guildData.channelId = null
  let data = Buffer.from(JSON.stringify(guildData))
  let msg2send = { content: 'TW data attached', flags: 64, file: data, fileName: `${gObj.data.guild.profile.id}-tw.json` }
  if(!guildData?.homeGuild?.conflictStatus) msg2send.content += `\n Home guild defense has been removed. Check again after TW finishes.`
  await replyMsg(obj, msg2send, 'POST')
}
