'use strict'
const { GetRaidMsg, GetTicketMsg } = require('./helper')
module.exports = async(obj, opt = [], guild)=>{
  try{
    let loginConfirm, gObj, raidMsg, msg2send = {content: 'You must have you google or guest auth linked to your discordId'}
    if(obj.confirm && obj.confirm.response) loginConfirm = obj.confirm.response
    const allyObj = await HP.GetPlayerAC(obj, opt)
    if(allyObj.type && allyObj.uId){
      await HP.ReplyButton(obj, 'Pulling guild data ...')
      msg2send.content = 'Error getting guild data'
      gObj = await Client.oauth(obj, 'guild', allyObj, {}, loginConfirm)
    }
    if(gObj && gObj.data && gObj.data.guild){
      msg2send.content = 'Error calculating tickets'
      await HP.CheckRaid(gObj.data.guild)
      const schedule = await mongo.find('raidSchedule', {guildId: gObj.data.guild.profile.id})
      const ticketMsg = await GetTicketMsg(obj, gObj.data.guild)
      if(schedule) raidMsg = await GetRaidMsg(schedule, gObj.data.guild.profile.name)
      if(ticketMsg || raidMsg){
        msg2send.content = null
        msg2send.embeds = []
        if(ticketMsg) msg2send.embeds.push(ticketMsg)
        if(raidMsg) msg2send.embeds.push(raidMsg)
      }
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
