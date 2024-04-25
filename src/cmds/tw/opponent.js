'use strict'
const swgohClient = require('src/swgohClient')
const { getDiscordAC, replyButton, replyTokenError, buttonPick, replyMsg } = require('src/helpers')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = { content: 'You do not have your google account linked to your discordId' }
  if(obj.confirm) replyButton(obj)
  let dObj = await getDiscordAC(obj.member.user.id, opt)
  if(!dObj?.uId && !dObj.type) return msg2send

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
  msg2send.content = `Found your opponent guild **${enemyName}**\nhttps://swgoh.gg/g/${enemyId}/`
  return msg2send
}
