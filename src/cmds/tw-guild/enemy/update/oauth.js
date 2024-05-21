'use strict'
const mongo = require('mongoclient')
const twReport = require('src/cmds/tw-guild/report')
const swgohClient = require('src/swgohClient')
const { getDiscordAC, replyTokenError } = require('src/helpers')

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

  let joined = gObj.data.guild.territoryWarStatus[0].optedInMember.map(x => x.memberId)
  await mongo.set('twStatus', { _id: gObj.data.guild.profile.id }, { enemy: enemyId, joined: joined })
  return await twReport(obj, opt, true)
}
