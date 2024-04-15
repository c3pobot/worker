'use strict'
const { botSettings } = require('src/helpers/botSettings')
const getHTML = require('webimg').unit
const { getOptValue, findUnit, getFakeUnit, getImg } = require('src/helpers')
const { formatUnit } = require('src/format')

module.exports = async(obj = {}, opt = [])=>{
  let gLevel = 13, rLevel = botSettings.maxRelic || 11, webData, unitImage
  let msg2send = {content: 'unit not provided'}
  let unit = getOptValue(opt, 'unit')?.toString()?.trim()
  if(!unit) return msg2send
  let rarity = +getOptValue(opt, 'rarity', 7)
  let gType = getOptValue(opt, 'gear1')
  let gValue = getOptValue(opt, 'value1')
  if(gType === 'g'){
    rLevel = 0
    if(gValue >= 0 && gValue < 13) gLevel = +gValue
  }
  if(gType === 'r'){
    if(gValue >= 0 && (+gValue + 2 < rLevel)) rLevel = +gValue + 2
  }
  msg2send.content = 'Error finding unit **'+unit+'**'
  let uInfo = await findUnit(obj, unit, guildId)
  if(uInfo === 'GETTING_CONFIRMATION') return
  if(!uInfo) return msg2send
  await replyButton(obj, 'Getting info for **'+uInfo.nameKey+'** ...')
  msg2send.content = 'Error calculating stats'
  let webUnit = await getFakeUnit(uInfo, gLevel, rLevel, rarity, true)
  if(webUnit) webUnit = await formatUnit(uInfo, webUnit)
  if(webUnit){
    webData = await getHTML.stats(webUnit, {footer: uInfo.nameKey + ' un-modded base stats'})
  }
  if(webData?.html){
    msg2send.content = 'Error getting image'
    unitImage = await getImg(webData.html, obj.id, 758, false)
  }
  if(unitImage){
    msg2send.content = null
    msg2send.file = unitImage
    msg2send.fileName = 'unit-'+uInfo.baseId+'.png'
  }
  return msg2send
}
