'use strict'
const GetImg = require('./getImg')
module.exports = async(obj, opt = [])=>{
  try{
    let msg2send = {content: 'You do not have allyCode linked to discordId'}, pObj, eObj, unit, uInfo, guildId, eAllyCode
    const dObj = await HP.GetDiscordAC(obj.member.user.id, opt)
    if(dObj && dObj.allyCode){
      msg2send.content = 'You must provide @user or allyCode to compare with'
      const edObj = await HP.GetPlayerAC({}, opt)
      if(edObj && edObj.mentionError) msg2send.content = 'That user does not have allyCode linked to discordId'
      if(edObj && edObj.allyCode){
        eAllyCode = edObj.allyCode
        const gObj = await HP.GetGuildId({dId: obj.member.id}, dObj, opt)
        if(gObj && gObj.guildId) guildId = gObj.guildId
      }
    }
    if(eAllyCode){
      msg2send.content = 'You did not provide the correct informaion'
      unit = HP.GetOptValue(opt, 'unit')
    }
    if(unit){
      msg2send.content = 'Error finding unit **'+unit+'**'
      uInfo = await HP.FindUnit(obj, unit, guildId)
    }
    if(uInfo){
      await HP.ReplyButton(obj, 'Getting info for **'+uInfo.nameKey+'** ...')
      msg2send.content = 'Error getting player data'
      pObj = await HP.FetchPlayer({allyCode: dObj.allyCode.toString()})
    }
    if(pObj?.rosterUnit?.length > 0){
      msg2send.content = '**'+eAllyCode+'** is not a valid allyCode'
      eObj = await HP.FetchPlayer({allyCode: eAllyCode.toString()})
    }
    if(eObj?.rosterUnit?.length > 0) msg2send = await GetImg(uInfo, pObj, eObj)
    await HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
