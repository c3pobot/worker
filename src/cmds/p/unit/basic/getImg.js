'use strict'
const log = require('logger')
const getHTML = require('webimg').unit
const { getImg } = require('src/helpers')
const { formatUnit } = require('src/format')

module.exports = async(uInfo = {}, pObj = {})=>{
  try{
    let res = {content: '**'+uInfo.nameKey+'** is not activated'}, webData, unitImage
    let webUnit = pObj.rosterUnit.find(x => x.definitionId.startsWith(uInfo.baseId + ':'))
    if(webUnit){
      res.content = 'Error Calcuting data'
      webUnit = await formatUnit(uInfo, webUnit)
      webData = await getHTML.stats(webUnit, {footer: pObj.name + '\'s ' + uInfo.nameKey + ' | Data Updated ' + (new Date(pObj.updated)).toLocaleString('en-US', {timeZone: 'America/New_York'})})
    }
    if(webData?.html){
      res.content = 'Error getting image'
      unitImage = await getImg(webData.html, null, (webUnit.equippedStatMod?.length > 0 ? 1118 : 758), false)
    }
    if(unitImage){
      res.content = null
      res.file = unitImage
      res.fileName = 'unit-'+uInfo.baseId+'.png'
    }
    return res
  }catch(e){
    console.error(e);
    return {content: 'error occured getting image'}
  }
}
