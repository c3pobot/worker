'use strict'
const mongo = require('mongoclient')
const swgohClient = require('src/swgohClient')
const { getDiscordAC, replyTokenError, getTBInfo } = require('src/helpers')

module.exports = async(obj = {}, opt = [])=>{
  let dObj = await getDiscordAC(obj.member.user.id, opt)
  if(!dObj?.uId || !dObj?.type) return { content: 'You do not have google auth linked to your discordId' }

  let gObj = await swgohClient.oauth(obj, 'guild', dObj, {})
  if(gObj === 'GETTING_CONFIRMATION') return gObj
  if(gObj?.error) return await replyTokenError(obj, dObj.allyCode, gObj.error)
  if(!gObj?.data?.guild) return { content: 'Error getting guild data' }

  gObj = gObj.data.guild
  await mongo.set('tempGuild', { _id: gObj.profile.id }, gObj)
  if(!gObj?.territoryBattleStatus || gObj?.territoryBattleStatus.length === 0) return { content: 'tb not in progress'}

  let battleStats = await swgohClient.oauth(obj, 'getMapStats', dObj, { territoryMapId: gObj.territoryBattleStatus[0].instanceId })
  if(battleStats === 'GETTING_CONFIRMATION') return battleStats
  if(battleStats?.error){
    await replyTokenError(obj, dObj.allyCode, gObj.error)
    return 'GETTING_CONFIRMATION';
  }
  if(battleStats?.msg2send) return { content: battleStats.msg2send }
  if(!battleStats?.data?.currentStat) return { content: 'error getting battle stats'}

  let tempObj = await getTBInfo(gObj, battleStats.data)
  if(!tempObj?.data || tempObj?.status !== 'ok') return { content: 'Error Calculating TB info'}

  return tempObj
}
