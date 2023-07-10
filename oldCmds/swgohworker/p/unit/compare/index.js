'use strict'
const GetImg = require('./getImg')
module.exports = async(obj, opt = [])=>{
  try{
    let allyCode, uInfo, guildId, msg2send = {content: 'You do not have allycode linked to discordId'}, gLevel = 13, rLevel = botSettings.maxRelic || 10, pObj
    let unit = HP.GetOptValue(opt, 'unit')
    if(unit) unit = unit.toString().trim()
    let rarity = HP.GetOptValue(opt, 'rarity')
    if(rarity) rarity = +rarity
    if(rarity > 7 || 0 >= rarity) rarity = 7
    const gType = HP.GetOptValue(opt, 'gear')
    const gValue = HP.GetOptValue(opt, 'value')
    if(gType === 'g'){
      rLevel = 0
      if(gValue >= 0 && gValue < 13) gLevel = +gValue
    }
    if(gType === 'r'){
      if(gValue >= 0 && (+gValue + 2 < rLevel)){
        rLevel = +gValue + 2
        rarity = 7
      }
    }
    const allyObj = await HP.GetPlayerAC(obj, opt)
    if(allyObj && allyObj.allyCode) allyCode = allyObj.allyCode
    if(allyObj && allyObj.mentionError) msg2send.content = 'that user does not have allyCode linked to discordId'

    if(allyCode && unit){
      msg2send.content = 'Error finding unit **'+unit+'**'
      const gObj = await HP.GetGuildId({dId: obj.member.user.id}, allyObj)
      if(gObj?.guildId) guildId = gObj.guildId
      uInfo = await HP.FindUnit(obj, unit, guildId)
    }
    if(uInfo){
      await HP.ReplyButton(obj, 'Getting info for **'+uInfo.nameKey+'** ...')
      msg2send.content = 'Error getting player info'
      pObj = await HP.FetchPlayer({allyCode: allyCode.toString()})
    }
    if(pObj?.allyCode) msg2send = await GetImg(uInfo, pObj, gLevel, rLevel, rarity);
    await HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
