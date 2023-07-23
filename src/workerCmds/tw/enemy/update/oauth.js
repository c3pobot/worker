'use strict'
const { mongo, CheckGuildAdmin, GetAllyCodeFromDiscordId, GetGuildId, GetOptValue, ReplyButton, ReplyMsg } = require('helpers')
const swgohClient = require('swgohClient')
const TWReport = require('../../report')
module.exports = async(obj, opt)=>{
  try{
    let msg2send = {content: 'You do not have your google account linked to your discordId'}, gObj
    if(obj.confirm) await ReplyButton(obj, 'Pulling guild data ...')
    let dObj = await GetAllyCodeFromDiscordId(obj.member.user.id, opt)
    if(dObj?.uId && dObj?.type){
      msg2send.content = 'Error getting guild data'
      let tempGuild = await swgohClient('guild', {}, dObj, obj)
      if(tempGuild?.error == 'invalid_grant'){
        await ReplyTokenError(obj, dObj.allyCode)
        return;
      }
      if(tempGuild === 'GETTING_CONFIRMATION') return
      if(tempGuild?.data?.guild){
        msg2send.content = 'There is not a TW in progress'
        gObj = tempGuild.data.guild
      }
    }
    if(gObj?.territoryWarStatus?.length > 0 && gObj.territoryWarStatus[0].awayGuild?.profile?.id){
      msg2send.content = 'Error getting guild data'
      let joined = gObj.territoryWarStatus[0].optedInMember.map(m =>m.memberId)

      await mongo.set('twStatus', {_id: gObj.profile.id}, {
        enemy: gObj.territoryWarStatus[0].awayGuild.profile.id,
        joined: joined
      })
      await TWReport(obj, opt, true)
      return
    }
    await ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
