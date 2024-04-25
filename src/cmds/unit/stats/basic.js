'use strict'
const { botSettings } = require('src/helpers/botSettings')
const getHTML = require('webimg').unit
const { getOptValue, findUnit, getFakeUnit, getImg, replyButton } = require('src/helpers')
const { formatUnit } = require('src/format')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = { content: 'unit not provided' }, gLevel = 13, rLevel = botSettings.maxRelic || 11
  if(obj.confirm) await replyButton(obj)
  let unit = getOptValue(opt, 'unit')?.toString()?.trim()
  if(!unit) return msg2send

  let uInfo = await findUnit(obj, unit)
  if(uInfo === 'GETTING_CONFIRMATION') return
  if(!uInfo) return { content: 'Error finding unit **'+unit+'**' }

  let rarity = getOptValue(opt, 'rarity', 7)
  let gType = getOptValue(opt, 'gear1')
  let gValue = getOptValue(opt, 'value1')
  if(gType === 'g'){
    rLevel = 0
    if(gValue >= 0 && gValue < 13) gLevel = +gValue
  }
  if(gType === 'r'){
    if(gValue >= 0 && (+gValue + 2 < rLevel)) rLevel = +gValue + 2
  }

  let webUnit = await getFakeUnit(uInfo, +gLevel, +rLevel, +rarity, true)
  if(webUnit) webUnit = await formatUnit(uInfo, webUnit)
  if(!webUnit) return { content: `Error getting stats for **${uInfo.nameKey}**` }

  let webData = await getHTML.stats(webUnit, {footer: uInfo.nameKey + ' un-modded base stats'})
  if(!webData?.html) return { content: 'error getting html' }

  let webImg = await getImg(webData.html, obj.id, 758, false)
  if(!webImg) return { content: 'error getting image' }

  msg2send.content = null
  msg2send.file = webImg
  msg2send.fileName = 'unit-'+uInfo.baseId+'.png'
  return msg2send
}
