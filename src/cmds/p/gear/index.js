'use strict'
const sorter = require('json-array-sorter')
const getHTML = require('webimg').gear

const { dataList } = require('src/helpers/dataList')

const { fetchPlayer, getGearParts, getImg, getPlayerAC, findUnit } = require('src/helpers')

module.exports = async(obj = {}, opt = {})=>{
  if(!dataList?.gameData?.unitData) return { content: 'gameData list is empty' }
  if(obj.confirm?.cancel) return { content: 'command canceled...', components: [] }

  let allyObj = await getPlayerAC(obj, opt)
  if(allyObj?.mentionError) return { content: 'that user does not have allyCode linked to discordId' }
  let allyCode = allyObj?.allyCode
  if(!allyCode) return msg2send

  let unit = opt.unit?.value?.toString()?.trim()
  if(!unit) return { content: 'you did not provide a unit' }

  let uInfo = await findUnit(obj, unit)
  if(uInfo?.msg2send) return uInfo.msg2send
  if(!uInfo?.baseId) return { content: `error finding ${unit}` }
  if(uInfo.combatType == 2) return { content: `ships don't have gear` }
  if(!dataList?.gameData.unitData[uInfo.baseId]?.gearLvl) return { content: `error getting ${uInfo.nameKey} gear list` }

  let pObj = await fetchPlayer({allyCode: allyCode.toString()})
  if(!pObj?.rosterUnit) return { content: 'error getting player data' }

  let gLevel = +(opt.tier?.value || 13)
  let pUnit = pObj.rosterUnit.find(x=>x?.definitionId?.startsWith(`${uInfo.baseId}:`))
  if(!pUnit?.currentTier) return { content: `${uInfo.nameKey} is not activated` }
  if(pUnit.currentTier >= gLevel) return { content: `${uInfo.nameKey} is already at or above G${gLevel}` }

  let unitGear = dataList?.gameData.unitData[uInfo.baseId]?.gearLvl

  let neededGear = {}
  for (let i = +pUnit.currentTier; i < gLevel; i++) {
    let tempUnitGear = unitGear[i].gear
    for (let g in tempUnitGear) {
      if (tempUnitGear[g] != '9999') continue
      if (!neededGear[tempUnitGear[g]]) {
        neededGear[tempUnitGear[g]] = {
          id: tempUnitGear[g],
          count: 0
        }
      }
      if (neededGear[tempUnitGear[g]]) neededGear[tempUnitGear[g]].count++
    }
  }
  if (pUnit.equipment?.length > 0) {
    for (let i in pUnit.equipment) {
      if (neededGear[pUnit.equipment[i].equipmentId]) neededGear[pUnit.equipment[i].equipmentId].count--
    }
  }
  let unequippedGear = Object.values(neededGear)
  if(!unequippedGear || unequippedGear?.length == 0) return { content: 'error finding needed gear' }

  let gearObj = {}, tempGear = {}
  for (let i in unequippedGear) {
    if (unequippedGear[i].count == 0 || unequippedGear[i].id != '9999') continue;
    let gearParts = await getGearParts(unequippedGear[i].id, tempGear)
    if (gearParts) {
      for (let a in gearParts) {
        if (!gearObj[gearParts[a].id]) gearObj[gearParts[a].id] = {
          count: 0,
          tier: gearParts[a].tier,
          mark: gearParts[a].mark,
          nameKey: gearParts[a].nameKey,
          iconKey: gearParts[a].iconKey
        };
        if (gearObj[gearParts[a].id]) gearObj[gearParts[a].id].count += (+gearParts[a].count * +unequippedGear[i].count || 1)
      }
    }
  }
  let gearArray = sorter([{ column: 'count', order: 'descending' }], Object.values(gearObj || {}))
  if(!gearArray || gearArray?.length == 0) return { content: 'error getting needed gear data' }

  let webData = await getHTML(gearArray, {
    nameKey: uInfo.nameKey,
    header: uInfo.nameKey + ' gear needed to go to Gear ' + gLevel,
    footer: pObj.name + '\'s ' + uInfo.nameKey + ' | Data Updated ' + (new Date(pObj.updated)).toLocaleString('en-US', {timeZone: 'America/New_York'})
  })
  if(!webData?.html) return { content: 'error getting html' }

  let webImg = await getImg(webData.html, obj.id, 924, false)
  if(!webImg) return { content: 'error getting image' }

  return { content: null, file: webImg, fileName: uInfo.baseId + "-gear.png" }
}
