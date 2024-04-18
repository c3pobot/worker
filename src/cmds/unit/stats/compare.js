'use strict'
const { botSettings } = require('src/helpers/botSettings')
const getHTML = require('webimg').unit
const { getOptValue, findUnit } = require('src/helpers')
const { formatUnit } = require('src/format')

module.exports = async(obj = {}, opt = [])=>{
  let gLevel1 = 13, rLevel1 = botSettings.maxRelic || 10, gLevel2 = 13, rLevel2 = botSettings.maxRelic || 10, webData, unitImage
  let msg2send = {content: 'unit not provided'}
  let unit = getOptValue(opt, 'unit')?.toString()?.trim()
  if(!unit) return msg2send
  let rarity = +getOptValue(opt, 'rarity', 7)
  let gType1 = getOptValue(opt, 'gear1')
  let gValue1 = getOptValue(opt, 'value1')
  let gType2 = getOptValue(opt, 'gear2')
  let gValue2 = getOptValue(opt, 'value2')
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
  msg2send.content = 'error finding unit **'+unit+'**'
  let uInfo = await findUnit(obj, unit, guildId)
  if(uInfo === 'GETTING_CONFIRMATION') return
  if(!uInfo) return msg2send
  await replyButton(obj, 'Getting info for **'+uInfo.nameKey+'** ...')
  msg2send.content = 'Error calculating stats'
  let webUnit1 = await getFakeUnit(uInfo, gLevel1, rLevel1, rarity, true)
  let webUnit2 = await getFakeUnit(uInfo, gLevel2, rLevel2, rarity, true)
  if(webUnit1) webUnit1 = await formatUnit(uInfo, webUnit1)
  if(webUnit2) webUnit2 = await formatUnit(uInfo, webUnit2)
  if(webUnit1 && webUnit2){
    msg2send.content = 'Error Calcuting data'
    webData = await getHTML.compare(webUnit1, webUnit2, uInfo, {footer: uInfo.nameKey + ' un-modded base stats'})
  }
  if(webData){
    msg2send.content = 'Error getting image'
    unitImage = await getImg(webData, obj.id, 1002, false)
  }
  if(unitImage){
    msg2send.content = null
    msg2send.file = unitImage
    msg2send.fileName = 'unit-'+uInfo.baseId+'.png'
  }
  return msg2send
}
