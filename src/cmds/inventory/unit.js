'use strict'
const getHTML = require('webimg').inventory

const { botSettings } = require('src/helpers/botSettings')
const { dataList } = require('src/helpers/dataList')

const { findUnit, getNeededGear, getNeededRelicMats, getImg } = require('src/helpers')

module.exports = async(obj = {}, opts = {}, pObj = {})=>{
  if(obj.confirm?.cancel) return { content: 'command canceled...', components: [] }
  if(!dataList?.gameData?.unitData) return { content: 'gameData list is empty.' }

  let unit = opt.unit?.value?.toString()?.trim()
  if(!unit) return { content: 'you did not provide a unit to search' }

  let uInfo = await findUnit(obj, unit)
  if(uInfo.msg2send) return uInfo.msg2send
  if(!uInfo?.baseId) return { content: `Error finding **${unit}**` }
  if(uInfo.combatType === 2) return { content: 'Ships don\'t have gear' }
  let gType = opt.gear?.value, gValue = opt.value?.value, gLevel = 13, rLevel
  if(gType === 'r'){
    rLevel = +((botSettings.maxRelic || 11) >= (gValue + 2) ? gValue: (botSettings.maxRelic || 11) - 2)
  }else{
    gLevel = (gValue < 14 ? gValue:13)
  }
  let unitGear = dataList?.gameData.unitData[uInfo.baseId]?.gearLvl
  if(!unitGear || !unitGear[gLevel]) return { content: `error getting ${uInfo.nameKey} gear data` }

  let relicRecipe, neededGear = [], currentRelicLevel = 0
  if(gType === 'r' && rLevel >= 0 ){
    relicRecipe = await mongo.find('recipe', {type: 'relic'})
    if(!relicRecipe || relicRecipe?.length === 0) return { content: 'Error getting relic info from db' }
    relicRecipe = relicRecipe.filter(x=>rLevel >= x.tier)
  }
  let pUnit = pObj?.inventory?.unit?.find(x=>x.definitionId.startsWith(uInfo.baseId+':'))
  if((!pUnit || +pUnit.currentTier < gLevel)) neededGear = await getNeededGear(pObj?.inventory?.equipment, pUnit?.equipment, unitGear, pUnit?.currentTier || 1, gLevel)
  if(!neededGear) return { content: 'Error getting gear data'}

  if(pUnit?.relic?.currentTier >= 2) currentRelicLevel = +pUnit.relic?.currentTier - 2
  let neededRelicMats = await getNeededRelicMats(pObj?.inventory?.material, relicRecipe, currentRelicLevel, rLevel)
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

  return { content: null, file: unitImg, fileName: `${uInfo.baseId}.png` }
}
