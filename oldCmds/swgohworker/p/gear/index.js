'use strict'
const GetHTML = require('webimg').gear
module.exports = async(obj, opt = [])=>{
  try{
    let unit, uInfo, allyCode, tempGear = {}, guildId, pObj, msg2send = {content: 'You do not have allycode linked to discordId'}, pUnit, unitGear, unequippedGear, gearArray, webData, gearImg
    let gLevel = HP.GetOptValue(opt, 'tier') || 13
    gLevel = +gLevel
    const allyObj = await HP.GetPlayerAC(obj, opt)
    if(allyObj && allyObj.allyCode) allyCode = allyObj.allyCode
    if(allyObj && allyObj.mentionError) msg2send.content = 'that user does not have allyCode linked to discordId'
    if(allyCode && !allyObj.mentionError){
      msg2send.content = 'you did not provide a unit to search'
      unit = HP.GetOptValue(opt, 'unit')
      if(unit) unit = unit.toString().trim()
      const gObj = await HP.GetGuildId(allyObj, allyObj, opt)
      if(gObj && gObj.guildId) guildId = gObj.guildId
    }
    if(unit){
      msg2send.content = 'Error finding unit **'+unit+'**'
      uInfo = await HP.FindUnit(obj, unit, guildId)
    }
    if(uInfo?.combatType == 2) msg2send.content = 'This command is only avaliable for character units'
    if(uInfo?.combatType == 1){
      await HP.ReplyButton(obj, 'Getting gear for **'+uInfo.nameKey+'** ...')
      msg2send.content = '**'+allyCode+'** is an invalid allyCode'
      pObj = await HP.FetchPlayer({allyCode: allyCode.toString()})
    }
    if(pObj?.allyCode){
      msg2send.content = '**'+uInfo.nameKey+'** is not activated'
      pUnit = pObj.rosterUnit.find(x => x.definitionId.startsWith(uInfo.baseId + ':'))
    }
    if(pUnit){
      msg2send.content = 'Error getting unit data'
      if(gameData?.unitData) unitGear = gameData.unitData[uInfo.baseId]?.gearLvl
    }
    if(unitGear && (gLevel == 13 || unitGear[gLevel])){
      msg2send.content = '**'+uInfo.nameKey+'** is already at gear '+(pUnit?.currentTier == 13 ? '13':gLevel)
    }
    if(pUnit?.currentTier && pUnit?.currentTier < gLevel){
      msg2send.content = 'Error calculating gear data'
      const neededGear = {}
      if(+pUnit.currentTier < gLevel){
        for (let i = +pUnit.currentTier; i < gLevel; i++) {
          const tempUnitGear = unitGear[i].gear
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
      const gearObj = {}
      for (let i in unequippedGear) {
        if (unequippedGear[i].count > 0) {
          if (unequippedGear[i].id != '9999') {
            const gearParts = await HP.GetGearParts(unequippedGear[i].id, tempGear)
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
      gearArray = await sorter([{ column: 'count', order: 'descending' }], Object.values(gearObj))
    }
    if(gearArray?.length > 0){
      webData = await GetHTML(gearArray, {
        nameKey: uInfo.nameKey,
        header: uInfo.nameKey + ' gear needed to go to Gear ' + gLevel,
        footer: pObj.name + '\'s ' + uInfo.nameKey + ' | Data Updated ' + (new Date(pObj.updated)).toLocaleString('en-US', {timeZone: 'America/New_York'})
      })
    }
    if(webData?.html){
      msg2send.content = 'Error getting image'
      let windowWidth = 924
      gearImg = await HP.GetImg(webData.html, windowWidth, false)
    }
    if(gearImg){
      msg2send.content = null
      msg2send.file = gearImg
      msg2send.fileName = uInfo.baseId + "-gear.png"
    }
    await HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
