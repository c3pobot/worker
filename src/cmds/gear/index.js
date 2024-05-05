'use strict'
const sorter = require('json-array-sorter')
const getHTML = require('webimg').gear

const { dataList } = require('src/helpers/dataList')
const { getGearParts, replyError, getImg, findUnit } = require('src/helpers')

module.exports = async(obj = {})=>{
  try{
    if(!dataList?.gameData?.unitData) return { content: 'gameData list is empty.' }
    if(obj.confirm?.cancel) return { content: 'command canceled...', components: [] }
    let opt = obj.data?.options || {}
    let unit = opt.unit?.value?.toString()?.trim()
    if(!unit) return { content: 'you did not provide a unit to search' }

    let uInfo = await findUnit(obj, unit)
    if(uInfo === 'GETTING_CONFIRMATION') return
    if(uInfo.msg2send) return uInfo.msg2send
    if(!uInfo?.baseId) return { content: `Error finding **${unit}**` }
    if(uInfo?.combatType == 2) return { content: 'Ships don\'t have gear' }

    let gLevel = +(opt.gear?.value || 13), gearInfo = { nameKey: uInfo.nameKey }, tempGear = {}, gearObj = {}
    let unitGear = dataList?.gameData.unitData[uInfo.baseId]?.gearLvl
    if(!unitGear || !unitGear[gLevel]) return { content: `error getting ${uInfo.nameKey} gear data` }

    if(gLevel == 13){
      for (let i in unitGear) {
        let gearList = unitGear[i].gear
        for (let g in gearList) {
          if (gearList[g] == '9999') continue;
          let gearParts = await getGearParts(gearList[g], tempGear)
          if(!gearParts) continue;
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
      gearInfo.header = uInfo.nameKey + '\'s Gear list for item count 30 and above'
    }
    if(gLevel < 13){
      let gearList = unitGear[gLevel].gear
      for (let i in gearList) {
        let gearParts = await getGearParts(gearList[i])
        if(!gearParts) continue
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
      gearInfo.header = uInfo.nameKey + '\'s Gear needed at Gear level ' + gLevel
    }
    let gearArray = sorter([{ column: 'count', order: 'descending' }], Object.values(gearObj) || [])
    if(gLevel == 13) gearArray = gearArray?.filter(x=>x.count > 29)
    if(!gearArray || gearArray?.length == 0) return { content: `error getting ${uInfo.nameKey} needed gear for G${gLevel}` }

    let webData = await getHTML(gearArray, gearInfo)
    if(!webData?.html) return { content: 'error getting html' }

    let webImg = await getImg(webData.html, obj.id, 924, false)
    if(!webImg) return { content: 'error getting image' }

    return { content: null, file: webImg, fileName: uInfo.baseId + "-gear.png" }
  }catch(e){
    replyError(obj)
    throw(e)
  }
}
