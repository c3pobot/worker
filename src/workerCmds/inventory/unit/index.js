'use strict'
const { configMaps } = require('helpers/configMaps')
const { botSettings } = require('helpers/botSettings')
const { mongo, GetOptValue, FindUnit, GetNeededGear, GetNeededRelicMats, GetScreenShot, ReplyButton, ReplyMsg } = require('helpers')
const getHTML = require('getHTML/inventory/unit')
module.exports = async(obj = {}, opts = [], pObj = {})=>{
  try{
    let msg2send = { content: 'error finding the requested unit' }, type, pUnit, unitGear, relicLevel, gearLevel, neededGear, neededRelicMats, relicRecipe, webHTML, webImg
    let baseId = GetOptValue(opts, 'unit')
    if(!baseId) baseId = FindUnit(obj, opt, 'unit')
    if(baseId === 'GETTING_CONFIRMATION') return
    if(baseId && configMaps?.UnitMap[baseId]){
      msg2send.content = 'Error finding gear for **'+configMaps.UnitMap[baseId].nameKey+'**'
      await ReplyButton(obj, 'Getting info for **'+configMaps.UnitMap[baseId].nameKey+'** ...')
      pUnit = pObj?.inventory?.unit?.find(x=>x.definitionId.startsWith(configMaps.UnitMap[baseId].baseId+':'))
      if(configMaps.UnitMap[baseId]?.combatType === 2){
        msg2send.content = 'Ships don\'t have gear'
        await ReplyMsg(obj, msg2send)
        return
      }
      let uInfo = (await mongo.find('unitList', {_id: baseId}, { gear: 1}))[0]
      unitGear = uInfo?.gear
      type = GetOptValue(opts, 'gear')
      let tier = GetOptValue(opts, 'value')
      if(!type) type = 'r'
      if(!tier) tier = (type === 'r' ? 7:13)
      if(tier) tier = +tier
      if(type === 'r'){
        relicLevel = ((botSettings?.map?.maxRelic || 11) >= (tier + 2) ? tier: (botSettings?.map?.maxRelic || 11) - 2)
        gearLevel = 13
      }else{
        gearLevel = (tier < 14 ? tier:13)
      }
    }
    if(unitGear){
      msg2send.content = 'Error getting gear/relic data'
      neededGear = []
      neededRelicMats = []
      if((!pUnit || +pUnit.currentTier < gearLevel)) neededGear = await GetNeededGear(pObj?.inventory?.equipment, pUnit?.equipment, unitGear, pUnit?.currentTier || 1, gearLevel)
    }
    if(type === 'r' && relicLevel >= 0){
      relicRecipe = await mongo.find('relicRecipeList', {})
      if(relicRecipe?.length > 0) relicRecipe = relicRecipe.filter(x=>relicLevel >= x.tier)
    }
    if(relicRecipe?.length > 0){
      msg2send.content = 'Error getting gear/relic data'
      let currentRelicLevel = 0
      if(pUnit?.relic?.currentTier >= 2) currentRelicLevel = +pUnit.relic?.currentTier - 2
      neededRelicMats = await GetNeededRelicMats(pObj?.inventory?.material, relicRecipe, currentRelicLevel, relicLevel)
    }
    if(neededRelicMats && neededGear){
      msg2send.content = 'Error getting HTML'
      let header = pObj?.player?.name+'\'s '+configMaps.UnitMap[baseId].nameKey
      if(pUnit){
        header += ' G'+pUnit.currentTier
        if(pUnit.currentTier == 13 && pUnit?.relic?.currentTier > 2) header += ' R'+(pUnit?.relic?.currentTier - 2)
      }
      let uInfo = {
        gearTier: pUnit?.currentTier || 0,
        relicTier: pUnit?.relic?.currentTier - 2 || 0,
        level: pUnit?.currentLevel || 0,
        rarity: pUnit?.currentRarity || 0,
        ultimate: pUnit?.purchasedAbilityId?.length || 0
      }
      let webData = { gear: neededGear, relicMats: neededRelicMats, gearLevel: gearLevel, relicLevel: relicLevel, header: header, unit: {...uInfo, ...configMaps.UnitMap[baseId]}, includeInventory: true, update: Date.now() }

      webHTML = getHTML(webData)
    }
    if(webHTML){
      msg2send.content = 'Error getting image'
      webImg = await GetScreenShot(webHTML, obj.id)
    }
    if(webImg){
      msg2send.content = null
      msg2send.file = webImg
      msg2send.fileName = baseId+'-gear.png'
    }
    await ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
