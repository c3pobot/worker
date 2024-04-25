'use strict'
const { botSettings } = require('src/helpers/botSettings')
const getHTML = require('webimg').unit
const { getOptValue, findUnit, replyButton, getImg, getFakeUnit } = require('src/helpers')
const { formatUnit } = require('src/format')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = { content: 'unit not provided' }, gLevel1 = 13, rLevel1 = botSettings.maxRelic || 10, gLevel2 = 13, rLevel2 = botSettings.maxRelic || 10
  if(obj.confirm) await replyButton(obj)
  let unit = getOptValue(opt, 'unit')?.toString()?.trim()
  if(!unit) return msg2send

  let uInfo = await findUnit(obj, unit)
  if(uInfo === 'GETTING_CONFIRMATION') return
  if(!uInfo?.baseId) return { content: `Error finding **${unit}**`}

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

  await replyButton(obj, 'Getting info for **'+uInfo.nameKey+'** ...')
  msg2send.content = 'Error calculating stats'

  let [ unit1, unit2 ] = await Promise.allSettled([
    getFakeUnit(uInfo, gLevel1, rLevel1, rarity, true),
    getFakeUnit(uInfo, gLevel2, rLevel2, rarity, true),
  ])
  if(!unit1?.value?.baseId || !unit2?.value?.baseId) return { content: `Error calculating stats` }

  let [ webUnit1, webUnit2 ] = await Promise.allSettled([
    formatUnit(uInfo, unit1.value),
    formatUnit(uInfo, unit2.value)
  ])
  if(!webUnit1?.value?.nameKey || !webUnit2?.value?.nameKey) return { content: `Error formating units` }

  let webData = await getHTML.compare(webUnit1.value, webUnit2.value, uInfo, {footer: uInfo.nameKey + ' un-modded base stats'})
  if(!webData) return { content: 'Error getting HTML' }

  let webImg = await getImg(webData, obj.id, 1002, false)
  if(!webImg) return { content: 'Error getting image' }

  msg2send.content = null
  msg2send.file = webImg
  msg2send.fileName = 'unit-'+uInfo.baseId+'.png'
  return msg2send
}
