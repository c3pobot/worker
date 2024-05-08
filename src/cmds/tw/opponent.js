'use strict'
const log = require('logger')
const swgohClient = require('src/swgohClient')
const { getDiscordAC, replyTokenError, replyMsg } = require('src/helpers')
const lazyGetGuild = async(guildId, opponentId)=>{
  try{
    if(guildId) await swgohClient.post('fetchTWGuild', { guildId: guildId, doNotReturnData: true })
    if(opponentId) await swgohClient.post('fetchTWGuild', { guildId: opponentId, doNotReturnData: true })
    log.info(`Guild fetch done`)
  }catch(e){
    log.error(e)
  }
}
module.exports = async(obj = {}, opt = {})=>{
  if(obj.confirm?.response == 'no') return { content: 'command canceled...' }

  let dObj = await getDiscordAC(obj.member.user.id, opt)
  if(!dObj?.uId && !dObj.type) return { content: 'You do not have your google account linked to your discordId' }

  let gObj = await swgohClient.oauth(obj, 'guild', dObj, {})
  if(gObj === 'GETTING_CONFIRMATION') return
  if(gObj?.error == 'invalid_grant'){
    await replyTokenError(obj, dObj.allyCode)
    return;
  }
  if(gObj?.msg2send) return { content: gObj.msg2send }
  if(!gObj?.data?.guild) return { content: 'Error getting guild data...'}
  if(!gObj?.data?.guild?.territoryWarStatus || gObj?.data?.guild?.territoryWarStatus?.length === 0) return { content: 'There is not a TW in progress' }

  let enemyId = gObj.data.guild.territoryWarStatus[0]?.awayGuild?.profile?.id, enemyName = gObj.data.guild.territoryWarStatus[0]?.awayGuild?.profile?.name
  if(!enemyId) return { content: 'Error getting opponent id...' }

  lazyGetGuild(gObj.data.guild.profile.id, enemyId)
  return { content: `Found your opponent guild **${enemyName}**\nhttps://swgoh.gg/g/${enemyId}/` }
}
