'use strict'
const GetHTML = require('webimg').unit
module.exports = async(obj = {}, opt = [])=>{
  try{
    let guildId, uInfo, gLevel1 = 13, rLevel1 = botSettings.maxRelic || 10, gLevel2 = 13, rLevel2 = botSettings.maxRelic || 10, webUnit1, webUnit2, webData, unitImage
    const msg2send = {content: 'unit not provided'}
    let unit = HP.GetOptValue(opt, 'unit')
    if(unit) unit = unit.toString().trim()
    let rarity = HP.GetOptValue(opt, 'rarity') || 7
    if(rarity) rarity = +rarity
    let gType1 = HP.GetOptValue(opt, 'gear1')
    let gValue1 = HP.GetOptValue(opt, 'value1')
    let gType2 = HP.GetOptValue(opt, 'gear2')
    let gValue2 = HP.GetOptValue(opt, 'value2')
    if(gType1 === 'g'){
      rLevel1 = 0
      if(gValue1 >= 0 && gValue1 < 13) gLevel1 = +gValue1
    }
    if(gType2 === 'g'){
      rLevel2 = 0
      if(gValue2 >= 0 && gValue2 < 13) gLevel2 = +gValue2
    }
    if(gType1 === 'r' && (gValue1 >= 0 && (+gValue1 + 2 < rLevel1))) rLevel1 = +gValue1 + 2
    if(gType2 === 'r' && (gValue2 >= 0 && (+gValue2 + 2 < rLevel2))) rLevel2 = +gValue2 + 2
    const pObj = await HP.GetGuildId({dId: obj.member.user.id})
    if(pObj && pObj.guildId) guildId = pObj.guildId
    if(unit){
      msg2send.content = 'error finding unit **'+unit+'**'
      uInfo = await HP.FindUnit(obj, unit, guildId)
    }
    if(uInfo){
      await HP.ReplyButton(obj, 'Getting info for **'+uInfo.nameKey+'** ...')
      msg2send.content = 'Error calculating stats'
      webUnit1 = await HP.GetFakeUnit(uInfo, gLevel1, rLevel1, rarity, true)
      webUnit2 = await HP.GetFakeUnit(uInfo, gLevel2, rLevel2, rarity, true)
      if(webUnit1) webUnit1 = await FT.FormatUnit(uInfo, webUnit1)
      if(webUnit2) webUnit2 = await FT.FormatUnit(uInfo, webUnit2)
    }
    if(webUnit1 && webUnit2){
      msg2send.content = 'Error Calcuting data'
      webData = await GetHTML.compare(webUnit1, webUnit2, uInfo, {footer: uInfo.nameKey + ' un-modded base stats'})
    }
    if(webData){
      msg2send.content = 'Error getting image'
      unitImage = await HP.GetImg(webData, obj.id, 1002, false)
    }
    if(unitImage){
      msg2send.content = null
      msg2send.file = unitImage
      msg2send.fileName = 'unit-'+uInfo.baseId+'.png'
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
