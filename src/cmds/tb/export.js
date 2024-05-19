'use strict'
const swgohClient = require('src/swgohClient')
const { getDiscordAC, replyTokenError, getTBInfo, replyMsg } = require('src/helpers')

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

  gObj = gObj.data.guild
  if(!gObj?.territoryBattleStatus || gObj?.territoryBattleStatus.length === 0) return { content: 'tb not in progress'}

  let battleStats = await swgohClient.oauth(obj, 'getMapStats', dObj, { territoryMapId: gObj.territoryBattleStatus[0].instanceId })
  if(battleStats === 'GETTING_CONFIRMATION') return battleStats
  if(battleStats?.error){
    await replyTokenError(obj, dObj.allyCode, gObj.error)
    return 'GETTING_CONFIRMATION';
  }
  if(battleStats?.msg2send) return { content: battleStats.msg2send }
  if(!battleStats?.data?.currentStat) return { content: 'error getting battle stats'}

  let tempObj = gObj.territoryBattleStatus[0]
  tempObj.profile = { id: gObj.profile.id, name: gObj.profile.name, guildGalacticPower: gObj.profile.guildGalacticPower }
  tempObj.currentStat = battleStats.data.currentStat
  tempObj.member = gObj?.member?.map(x=>{ return { playerId: x.playerId, playerName: x.playerName, shipGalacticPower: x.shipGalacticPower, characterGalacticPower: x.characterGalacticPower, galacticPower: x.galacticPower }})
  delete tempObj.playerStatus
  await replyMsg(obj, { content: 'TB data attached', flags: 64, file: Buffer.from(JSON.stringify(tempObj)), fileName: `${gObj.profile.id}-tb.json` }, 'POST')
}
