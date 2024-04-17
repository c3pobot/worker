'use strict'
const swgohClient = require('src/swgohClient')
const { replyButton, getDiscordAC, replyTokenError } = require('src/helpers')

module.exports = async(obj = {}, opt = [])=>{
  let dObj = await getDiscordAC(obj.member.user.id, opt)
  if(!dObj?.uId || !dObj?.type) return { content: 'You do not have google auth linked to your discordId' }

  let loginConfirm = obj.confirm?.response
  if(obj.confirm) await replyButton(obj, 'Pulling guild TB data ...')
  let gObj = await swgohClient.oauth(obj, 'guild', dObj, {}, loginConfirm)
  if(gObj === 'GETTING_CONFIRMATION') return gObj
  if(gObj?.error){
    await replyTokenError(obj, dObj.allyCode, gObj.error)
    return 'GETTING_CONFIRMATION';
  }
  if(!gObj?.data?.guild) return { content: 'Error getting guild data'}

  gObj = gObj.data.guild
  if(!gObj?.territoryBattleStatus || gObj?.territoryBattleStatus.length === 0) return { content: 'tb not in progress'}
  
  let battleStats = await swgohClient.oauth(obj, 'getMapStats', dObj, {territoryMapId: gObj.territoryBattleStatus[0].instanceId}, loginConfirm)
  if(battleStats === 'GETTING_CONFIRMATION') return battleStats
  if(battleStats?.error){
    await replyTokenError(obj, dObj.allyCode, gObj.error)
    return 'GETTING_CONFIRMATION';
  }
  if(!battleStats?.data?.currentStat) return { content: 'error getting battle stats'}

  let guildStats = await swgohClient.post('fetchGuild', { token: obj.token, id: gObj.profile.id, projection: {playerId: 1, name: 1, gp: 1, gpChar: 1, gpShip: 1, allyCode: 1}})
  if(!guildStats?.member) return { content: 'Error getting guild data...'}

  let tempObj = await getTBInfo(gObj, battleStats.data, guildStats)
  if(!tempObj?.data || tempObj?.status !== 'ok') return { content: 'Error Calculating TB info'}

  return tempObj
}
