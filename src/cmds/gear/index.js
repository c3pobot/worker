'use strict'
const { dataList } = require('src/helpers/dataList')
const sorter = require('json-array-sorter')
const getHTML = require('webimg').gear
const { getOptValue, getGearParts, replyButton, replyError, getImg } = require('src/helpers')

module.exports = async(obj = {})=>{
  try{
    let uInfo, tempGear = {}, msg2send = {content: 'Error getting unit'}, opt = obj?.data?.options || [], unitGear, gearArray, gearInfo = {}, gearImg, webData
    let unit = getOptValue(opt, 'unit')
    if(unit) unit = unit.toString().trim()
    let gLevel = getOptValue(obj.data.options, 'gear') || 13
    if(gLevel) gLevel = +gLevel
    if(unit){
      msg2send.content = 'Error finding unit **'+unit+'**'
      uInfo = await findUnit(obj, unit)
      if(uInfo === 'GETTING_CONFIRMATION') return
    }
    if(uInfo?.combatType == 2) msg2send.content = 'Ships don\'t have gear'
    if(uInfo?.combatType == 1){
      await replyButton(obj, 'Getting gear for **'+uInfo.nameKey+'** ...')
      gearInfo.nameKey = uInfo.nameKey
      msg2send.content = 'Error getting unit data'
      if(dataList?.gameData?.unitData) unitGear = dataList?.gameData.unitData[uInfo.baseId]?.gearLvl
    }
    if(unitGear && (gLevel == 13 || unitGear[gLevel])){
      msg2send.content = 'Error getting gear info'
      let gearObj = {}
      if(gLevel == 13){
        for (let i in unitGear) {
          let gearList = unitGear[i].gear
          for (let g in gearList) {
            if (gearList[g] != '9999') {
              let gearParts = await getGearParts(gearList[g], tempGear)
              if (gearParts) {
                for (let a in gearParts) {
                  if (!gearObj[gearParts[a].id]) gearObj[gearParts[a].id] = {
                    count: 0,
                    tier: gearParts[a].tier,
                    mark: gearParts[a].mark,
                    nameKey: gearParts[a].nameKey,
                    iconKey: gearParts[a].iconKey
                  };
                  if (gearObj[gearParts[a].id]) gearObj[gearParts[a].id].count += (+gearParts[a].count || 1)
                }
              }
            }
          }
        }
        gearInfo.header = uInfo.nameKey + '\'s Gear list for item count 30 and above'
      }else{
        let gearList = unitGear[gLevel].gear
        for (let i in gearList) {
          let gearParts = await getGearParts(gearList[i])
          if (gearParts) {
            for (let a in gearParts) {
              if (!gearObj[gearParts[a].id]) gearObj[gearParts[a].id] = {
                count: 0,
                tier: gearParts[a].tier,
                mark: gearParts[a].mark,
                nameKey: gearParts[a].nameKey,
                iconKey: gearParts[a].iconKey
              };
              if (gearObj[gearParts[a].id]) gearObj[gearParts[a].id].count += (+gearParts[a].count || 1)
            }
          }
        }
        gearInfo.header = uInfo.nameKey + '\'s Gear needed at Gear level ' + gLevel
      }
      gearArray = sorter([{ column: 'count', order: 'descending' }], Object.values(gearObj))
      if(gLevel == 13) gearArray = gearArray.filter(x=>x.count > 29)
    }
    if(gearArray?.length > 0){
      msg2send.content = 'Error getting Html'
      webData = await getHTML(gearArray, gearInfo)
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
  }catch(e){
    replyError(obj)
    throw(e)
  }
}
