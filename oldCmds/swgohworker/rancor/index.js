'use strict'
const { GetMsg } = require('./helper')
module.exports = async(obj, opt)=>{
  try{
    let gObj, loginConfirm, msg2send = {content: 'You do not have your google/fb account linked to your discordId'}
    if(obj.confirm && obj.confirm.response) loginConfirm = obj.confirm.response
    const allyObj = await HP.GetPlayerAC(obj, opt)
    if(allyObj.type && allyObj.uId){
      await HP.ReplyButton(obj, 'Pulling guild data ...')
      msg2send.content = 'Error getting guild data'
      gObj = await Client.oauth(obj, 'guild', allyObj, {}, loginConfirm)
    }
    if(gObj && gObj.data && gObj.data.guild){
      msg2send.content = 'Error calculating tickets'
      const embedMsg = await GetMsg(obj, gObj.data.guild)
      if(embedMsg){
        msg2send.content = null
        msg2send.embeds = [embedMsg]
      }
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
