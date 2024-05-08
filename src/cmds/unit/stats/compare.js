'use strict'
const { botSettings } = require('src/helpers/botSettings')
const getHTML = require('webimg').unit
const { findUnit, getImg, getFakeUnit } = require('src/helpers')
const { formatUnit } = require('src/format')

module.exports = async(obj = {}, opt = {})=>{
  if(obj.confirm?.cancel) return { content: 'command canceled...', components: [] }
  
  let unit = opt.unit?.value?.toString()?.trim()
  if(!unit) return { content: 'unit not provided' }

  let uInfo = await findUnit(obj, unit)
  if(uInfo === 'GETTING_CONFIRMATION') return
  if(!uInfo?.baseId) return { content: 'Error finding unit **'+unit+'**' }

  let rarity = +(opt.rarity?.value || 7), gType1 = opt.gear1?.value, gValue1 = opt.value1?.value, gLevel1 = 13, rLevel1 = botSettings.maxRelic || 11
  let gType2 = opt.gear2?.value, gValue2 = opt.value2?.value, gLevel2 = 13, rLevel2 = botSettings.maxRelic || 11
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

  return { content: null, file: webImg, fileName: 'unit-'+uInfo.baseId+'.png' }
}
