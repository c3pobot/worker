'use strict'
const GetImg = require('./getImg')
module.exports = async(obj, opt)=>{
  try{
    let uInfo, allyCode, guildId, msg2send = {content: 'You do not have allycode linked to discordId'}, pObj
    let unit = HP.GetOptValue(opt, 'unit')
    if(unit) unit = unit.toString().trim()
    const allyObj = await HP.GetPlayerAC(obj, opt)
    if(allyObj && allyObj.allyCode) allyCode = allyObj.allyCode
    if(allyObj && allyObj.mentionError) msg2send.content = 'that user does not have allyCode linked to discordId'
    if(allyCode){

      msg2send.content = 'Error getting data for allyCode **'+allyCode+'**'
      const gObj = await HP.GetGuildId(allyObj, allyObj)
      if(gObj && gObj.guildId) guildId = gObj.guildId
    }
    if(allyCode && unit){
      HP.ReportDebug(obj, 'getting unit')
      msg2send.content = 'Error finding unit **'+unit+'**'
      uInfo = await HP.FindUnit(obj, unit, guildId)
    }
    if(uInfo){
      await HP.ReplyButton(obj, 'Getting info for **'+uInfo.nameKey+'** ...')
      msg2send.content = 'Error getting player info'
      pObj = await HP.FetchPlayer({allyCode: allyCode.toString()})
    }
    if(pObj?.allyCode){
      HP.ReportDebug(obj, 'getting image')
      msg2send = await GetImg(uInfo, pObj)
    }
    await HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
