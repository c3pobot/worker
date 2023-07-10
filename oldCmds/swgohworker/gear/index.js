'use strict'
const GetHTML = require('webimg').gear
module.exports = async(obj = {})=>{
  try{
    let guildId, uInfo, tempGear = {}, msg2send = {content: 'Error getting unit'}, opt = obj?.data?.options || [], unitGear, gearArray, gearInfo = {}, gearImg, webData
    let unit = HP.GetOptValue(opt, 'unit')
    if(unit) unit = unit.toString().trim()
    let gLevel = HP.GetOptValue(obj.data.options, 'gear') || 13
    if(gLevel) gLevel = +gLevel
    const pObj = await HP.GetGuildId({dId: obj.member.user.id})
    if(pObj?.guildId) guildId = pObj.guildId
    if(unit){
      msg2send.content = 'Error finding unit **'+unit+'**'
      uInfo = await HP.FindUnit(obj, unit, guildId)
    }
    if(uInfo?.combatType == 2) msg2send.content = 'Ships don\'t have gear'
    if(uInfo?.combatType == 1){
      await HP.ReplyButton(obj, 'Getting gear for **'+uInfo.nameKey+'** ...')
      gearInfo.nameKey = uInfo.nameKey
      msg2send.content = 'Error getting unit data'
      if(gameData?.unitData) unitGear = gameData.unitData[uInfo.baseId]?.gearLvl
    }
    if(unitGear && (gLevel == 13 || unitGear[gLevel])){
      msg2send.content = 'Error getting gear info'
      const gearObj = {}
      if(gLevel == 13){
        for (let i in unitGear) {
          const gearList = unitGear[i].gear
          for (let g in gearList) {
            if (gearList[g] != '9999') {
              const gearParts = await HP.GetGearParts(gearList[g], tempGear)
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
        const gearList = unitGear[gLevel].gear
        for (let i in gearList) {
          const gearParts = await HP.GetGearParts(gearList[i])
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
      gearArray = await sorter([{ column: 'count', order: 'descending' }], Object.values(gearObj))
      if(gLevel == 13) gearArray = gearArray.filter(x=>x.count > 29)
    }
    if(gearArray?.length > 0){
      msg2send.content = 'Error getting Html'
      webData = await GetHTML(gearArray, gearInfo)
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
