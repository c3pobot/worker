'use strict'
const log = require('logger')
const getHTML = require('webimg').unit

const { getImg } = require('src/helpers')
const { formatUnit } = require('src/format')

module.exports = async(uInfo = {}, pObj = {})=>{
  try{
    let webUnit = pObj.rosterUnit?.find(x => x.definitionId.startsWith(uInfo.baseId + ':'))
    if(webUnit) webUnit = await formatUnit(uInfo, webUnit)
    if(!webUnit) return { content: '**'+uInfo.nameKey+'** is not activated' }

    let webData = await getHTML.stats(webUnit, {footer: pObj.name + '\'s ' + uInfo.nameKey + ' | Data Updated ' + (new Date(pObj.updated)).toLocaleString('en-US', {timeZone: 'America/New_York'})})
    if(!webData?.html) return { content: 'error getting html' }

    let webImg = await getImg(webData.html, null, (webUnit.equippedStatMod?.length > 0 ? 1118 : 758), false)
    if(!webImg) return { content: 'error getting image..' }

    return { content: null, file: webImg, fileName: 'unit-'+uInfo.baseId+'.png' }
  }catch(e){
    log.error(e);
    return { content: 'error occured getting image' }
  }
}
