'use strict'
const { botSettings } = require('src/helpers/botSettings')
const getHTML = require('webimg').unit
const { findUnit, getFakeUnit, getImg, getRelicLevel } = require('src/helpers')
const { formatUnit } = require('src/format')

module.exports = async(obj = {}, opt = {})=>{
  if(obj.confirm?.cancel) return { content: 'command canceled...', components: [] }

  let unit = opt.unit?.value?.toString()?.trim()
  if(!unit) return { content: 'unit not provided' }

  let uInfo = await findUnit(obj, unit)
  if(uInfo === 'GETTING_CONFIRMATION') return
  if(!uInfo?.baseId) return { content: 'Error finding unit **'+unit+'**' }

  let rarity = +(opt.rarity?.value || 7)
  let { gLevel, rLevel } = getRelicLevel(opt, botSettings.maxRelic || 11, 13)
  if(rLevel > 0) rLevel += 2
  let webUnit = await getFakeUnit(uInfo, +gLevel, +rLevel, +rarity, true)
  if(webUnit) webUnit = await formatUnit(uInfo, webUnit)
  if(!webUnit) return { content: `Error getting stats for **${uInfo.nameKey}**` }

  let webData = await getHTML.stats(webUnit, {footer: uInfo.nameKey + ' un-modded base stats'})
  if(!webData?.html) return { content: 'error getting html' }

  let webImg = await getImg(webData.html, obj.id, 758, false)
  if(!webImg) return { content: 'error getting image' }

  return { content: null, file: webImg, fileName: 'unit-'+uInfo.baseId+'.png' }
}
