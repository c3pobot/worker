'use strict'
const { dataList } = require('src/helpers/dataList')
const sorter = require('json-array-sorter')
const getHTML = require('webimg').gear
const { fetchPlayer, getGearParts, getImg, getOptValue, getPlayerAC, findUnit, replyButton } = require('src/helpers')

module.exports = async(obj = {}, opt = [])=>{
  let uInfo, allyCode, tempGear = {}, msg2send = {content: 'You do not have allycode linked to discordId'}, pUnit, unitGear, unequippedGear, gearArray, webData, gearImg
  let gLevel = getOptValue(opt, 'tier') || 13
  gLevel = +gLevel
  let allyObj = await getPlayerAC(obj, opt)
  if(allyObj?.mentionError) return { content: 'that user does not have allyCode linked to discordId' }
  if(allyObj?.allyCode) allyCode = allyObj.allyCode
  if(!allyCode) return msg2send
  msg2send.content = 'you did not provide a unit to search'
  let unit = getOptValue(opt, 'unit')
  if(unit){
    unit = unit.toString().trim()
    uInfo = await findUnit(obj, unit)
    if(uInfo === 'GETTING_CONFIRMATION') return
  }
  if(!uInfo) return { content: 'Error finding unit **'+unit+'**' }
  if(uInfo.combatType == 2) return { content: 'This command is only avaliable for character units' }
  await replyButton(obj, 'Getting gear for **'+uInfo.nameKey+'** ...')
  msg2send.content = '**'+allyCode+'** is an invalid allyCode'
  let pObj = await fetchPlayer({allyCode: allyCode.toString()})
  if(pObj?.allyCode){
    msg2send.content = '**'+uInfo.nameKey+'** is not activated'
    pUnit = pObj.rosterUnit.find(x => x.definitionId.startsWith(uInfo.baseId + ':'))
  }
  if(pUnit){
    msg2send.content = 'Error getting unit data'
    if(dataList?.gameData?.unitData) unitGear = dataList?.gameData.unitData[uInfo.baseId]?.gearLvl
  }
  if(unitGear && (gLevel == 13 || unitGear[gLevel])){
    msg2send.content = '**'+uInfo.nameKey+'** is already at gear '+(pUnit?.currentTier == 13 ? '13':gLevel)
  }
  if(pUnit?.currentTier && pUnit?.currentTier < gLevel){
    msg2send.content = 'Error calculating gear data'
    let neededGear = {}
    if(+pUnit.currentTier < gLevel){
      for (let i = +pUnit.currentTier; i < gLevel; i++) {
        let tempUnitGear = unitGear[i].gear
        for (let g in tempUnitGear) {
          if (tempUnitGear[g] != '9999') {
            if (!neededGear[tempUnitGear[g]]) {
              neededGear[tempUnitGear[g]] = {
                id: tempUnitGear[g],
                count: 0
              }
            }
            if (neededGear[tempUnitGear[g]]) neededGear[tempUnitGear[g]].count++
          }
        }
      }
      if (pUnit.equipment?.length > 0) {
        for (let i in pUnit.equipment) {
          if (neededGear[pUnit.equipment[i].equipmentId]) neededGear[pUnit.equipment[i].equipmentId].count--
        }
      }
    }
    unequippedGear = Object.values(neededGear)
  }
  if(unequippedGear?.length > 0){
    let gearObj = {}
    for (let i in unequippedGear) {
      if (unequippedGear[i].count > 0) {
        if (unequippedGear[i].id != '9999') {
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
      }
    }
    gearArray = sorter([{ column: 'count', order: 'descending' }], Object.values(gearObj))
  }
  if(gearArray?.length > 0){
    webData = await getHTML(gearArray, {
      nameKey: uInfo.nameKey,
      header: uInfo.nameKey + ' gear needed to go to Gear ' + gLevel,
      footer: pObj.name + '\'s ' + uInfo.nameKey + ' | Data Updated ' + (new Date(pObj.updated)).toLocaleString('en-US', {timeZone: 'America/New_York'})
    })
  }
  if(webData?.html){
    msg2send.content = 'Error getting image'
    let windowWidth = 924
    gearImg = await getImg(webData.html, obj.id, windowWidth, false)
  }
  if(gearImg){
    msg2send.content = null
    msg2send.file = gearImg
    msg2send.fileName = uInfo.baseId + "-gear.png"
  }
  return msg2send
}
