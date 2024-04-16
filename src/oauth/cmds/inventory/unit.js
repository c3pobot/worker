'use strict'
const { botSettings } = require('src/helpers/botSettings')
const { dataList } = require('src/helpers/dataList')
const getHTML = require('webimg').inventory
const { getOptValue, getUnit, getNeededGear, getNeededRelicMats, getImg } = require('src/helpers')

module.exports = async(obj = {}, opts = [], pObj = {})=>{
  let msg2send = { content: 'you did not provide the correct information' }, relicLevel, gearLevel, relicRecipe
  let unit = await getOptValue(opts, 'unit')?.toString()?.trim()
  if(!unit) return { content: 'you did not provide a unit'}

  let uInfo = await getUnit(unit)
  if(!uInfo?.baseId) return { content: `Error finding **${unit}**...`}
  if(uInfo.combatType === 2) return { content: 'Ships don\'t have gear' }

  let unitGear = dataList?.gameData?.unitData[uInfo.baseId]?.gearLvl
  if(!unitGear) return { content: `Error finding gear for **${uInfo.nameKey}**...`}
  let pUnit = pObj?.inventory?.unit?.find(x=>x.definitionId.startsWith(uInfo.baseId+':'))
  let tier = getOptValue(opts, 'value')
  let type = getOptValue(opts, 'gear', 'r')
  if(!tier) tier = (type === 'r' ? 7:13)
  if(type === 'r'){
    relicLevel = ((botSettings.maxRelic || 11) >= (tier + 2) ? tier: (botSettings.maxRelic || 11) - 2)
    gearLevel = 13
  }else{
    gearLevel = (tier < 14 ? tier:13)
  }
  if(type === 'r' && relicLevel >= 0){
    relicRecipe = await mongo.find('recipe', {type: 'relic'})
    if(!relicRecipe || relicRecipe?.length === 0) return { content: 'Error getting relic info from db' }
    relicRecipe = relicRecipe.filter(x=>relicLevel >= x.tier)
  }
  let neededGear = []

  if((!pUnit || +pUnit.currentTier < gearLevel)) neededGear = await getNeededGear(pObj?.inventory?.equipment, pUnit?.equipment, unitGear, pUnit?.currentTier || 1, gearLevel)
  if(!neededGear) return { content: 'Error getting gear data'}

  let currentRelicLevel = 0
  if(pUnit?.relic?.currentTier >= 2) currentRelicLevel = +pUnit.relic?.currentTier - 2
  let neededRelicMats = await getNeededRelicMats(pObj?.inventory?.material, relicRecipe, currentRelicLevel, relicLevel)
  if(!neededRelicMats) return { content: 'Error getting relic data'}

  let header = pObj?.player?.name+'\'s '+uInfo.nameKey
  if(pUnit){
    header += ' G'+pUnit.currentTier
    if(pUnit.currentTier == 13 && pUnit?.relic?.currentTier > 2) header += ' R'+(pUnit?.relic?.currentTier - 2)
  }
  let unitHTML = await getHTML.unit(neededGear, neededRelicMats, uInfo, {gearLevel: gearLevel, relicLevel: relicLevel, header: header })
  if(!unitHTML) return { content: 'Error getting HTML' }

  let unitImg = await getImg(unitHTML, obj.id, 640, false)
  if(!unitImg) return { content: 'Error getting image'}

  msg2send.content = null
  msg2send.file = unitImg
  msg2send.fileName = 'unit.png'
  return msg2send
}
