'use strict'
const { botSettings } = require('src/helpers/botSettings')
const getHTML = require('webimg').unit
const { findUnit, getImg, getFakeUnit, getRelicLevel } = require('src/helpers')
const { formatUnit } = require('src/format')
const getCompareValues = (opt = {})=>{
  let values1 = getRelicLevel(opt, +(botSettings.maxRelic || 11), 13)
  let values2 = getRelicLevel({ relic_level: opt.relic_level_2, gear_level: opt.gear_level_2 }, +(botSettings.maxRelic || 11), 13)
  if(values1?.rLevel > 0) values1.rLevel += 2
  if(values2?.rLevel > 0) values2.rLevel += 2
  return { rLevel1: values1?.rLevel, gLevel1: values1?.gLevel, rLevel2: values2?.rLevel, gLevel2: values2?.gLevel }
}

module.exports = async(obj = {}, opt = {})=>{
  if(obj.confirm?.cancel) return { content: 'command canceled...', components: [] }

  let unit = opt.unit?.value?.toString()?.trim()
  if(!unit) return { content: 'unit not provided' }

  let uInfo = await findUnit(obj, unit)
  if(uInfo === 'GETTING_CONFIRMATION') return
  if(!uInfo?.baseId) return { content: 'Error finding unit **'+unit+'**' }

  let rarity = +(opt.rarity?.value || 7)
  let { rLevel1, gLevel1, rLevel2, gLevel2 } = getCompareValues(opt)
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
