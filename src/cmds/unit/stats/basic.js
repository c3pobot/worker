'use strict'
const GetHTML = require('webimg').unit
module.exports = async(obj = {}, opt = [])=>{
  try{
    let guildId, uInfo,  gLevel = 13, rLevel = botSettings.maxRelic || 11, webUnit, webData, unitImage
    const msg2send = {content: 'unit not provided'}
    let unit = HP.GetOptValue(opt, 'unit')
    if(unit) unit = unit.toString().trim()
    let rarity = HP.GetOptValue(opt, 'rarity') || 7
    if(rarity) rarity = +rarity
    let gType = HP.GetOptValue(opt, 'gear1')
    let gValue = HP.GetOptValue(opt, 'value1')
    if(gType === 'g'){
      rLevel = 0
      if(gValue >= 0 && gValue < 13) gLevel = +gValue
    }
    if(gType === 'r'){
      if(gValue >= 0 && (+gValue + 2 < rLevel)) rLevel = +gValue + 2
    }
    const pObj = await HP.GetGuildId({dId: obj.member.user.id})
    if(pObj && pObj.guildId) guildId = pObj.guildId
    if(unit){
      msg2send.content = 'Error finding unit **'+unit+'**'
      uInfo = await HP.FindUnit(obj, unit, guildId)
    }
    if(uInfo){
      await HP.ReplyButton(obj, 'Getting info for **'+uInfo.nameKey+'** ...')
      msg2send.content = 'Error calculating stats'
      webUnit = await HP.GetFakeUnit(uInfo, gLevel, rLevel, rarity, true)
      if(webUnit) webUnit = await FT.FormatUnit(uInfo, webUnit)
    }
    if(webUnit){
      webData = await GetHTML.stats(webUnit, {footer: uInfo.nameKey + ' un-modded base stats'})
    }
    if(webData?.html){
      msg2send.content = 'Error getting image'
      unitImage = await HP.GetImg(webData.html, obj.id, 758, false)
    }
    if(unitImage){
      msg2send.content = null
      msg2send.file = unitImage
      msg2send.fileName = 'unit-'+uInfo.baseId+'.png'
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e)
    HP.ReplyError(obj)
  }
}
