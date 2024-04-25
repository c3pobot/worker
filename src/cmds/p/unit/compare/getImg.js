'use strict'
const log = require('logger')
const getHTML = require('webimg').unit
const { modifyUnit, getImg } = require('src/helpers')
const { formatUnit } = require('src/format')

module.exports = async(uInfo = {}, pObj = {}, gLevel, rLevel, rarity)=>{
  try{
    let msg2send = { content: '**'+uInfo.nameKey+'** is not activated' }
    let webUnit1 = pObj.rosterUnit.find(x => x.definitionId.startsWith(uInfo.baseId + ':'))
    if(!webUnit1) return msg2send

    let webUnit2 = await modifyUnit(uInfo, pObj.rosterUnit, gLevel, rLevel, rarity, true)
    if(!webUnit2?.stats) return { content: `Error modifying **${uInfo.nameKey}**`}
    let [ unit1, unit2 ] = await Promise.allSettled([
      formatUnit(uInfo, webUnit1),
      formatUnit(uInfo, webUnit2)
    ])
    log.info(unit1)
    if(!unit1?.value?.nameKey || !unit2?.value?.nameKey) return { content: `Error formating unit` }

    unit1 = unit1.value, unit2 = unit2.value
    let webData = await getHTML.compare(unit1, unit2, uInfo, { footer: pObj.name + '\'s ' + uInfo.nameKey + ' | Data Updated ' + (new Date(pObj.updated)).toLocaleString('en-US', {timeZone: 'America/New_York'}) })
    if(!webData) return { content: 'error getting html' }

    let webImg = await getImg(webData, null, 1002, false)
    if(!webImg) return { content: 'Error getting image' }

    msg2send.content = null
    msg2send.file = webImg
    msg2send.fileName = 'unit-'+uInfo.baseId+'.png'
    return msg2send
  }catch(e){
    log.error(e);
    return { content: 'error getting image' }
  }
}
