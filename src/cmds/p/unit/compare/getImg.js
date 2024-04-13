'use strict'
const log = require('logger')
const getHTML = require('webimg').unit
const { modifyUnit, getImg } = require('src/helpers')
const { formatUnit } = require('src/format')

module.exports = async(uInfo = {}, pObj = {}, gLevel, rLevel, rarity)=>{
  try{
    let res = {content: '**'+uInfo.nameKey+'** is not activated'}, webUnit2, webData, unitImage
    let webUnit1 = pObj.rosterUnit.find(x => x.definitionId.startsWith(uInfo.baseId + ':'))

    if(webUnit1){
      webUnit2 = await modifyUnit(uInfo, pObj.rosterUnit, gLevel, rLevel, rarity, true)
      if(webUnit2){
        webUnit1 = await formatUnit(uInfo, webUnit1)
        webUnit2 = await formatUnit(uInfo, webUnit2)
      }
    }
    if(webUnit1 && webUnit2){
      res.content = 'Error Calcuting data'
      webData = await getHTML.compare(webUnit1, webUnit2, uInfo, {footer: pObj.name + '\'s ' + uInfo.nameKey + ' | Data Updated ' + (new Date(pObj.updated)).toLocaleString('en-US', {timeZone: 'America/New_York'})})
    }
    if(webData){
      res.content = 'Error getting image'
      unitImage = await getImg(webData, null, 1002, false)
    }
    if(unitImage){
      res.content = null
      res.file = unitImage
      res.fileName = 'unit-'+uInfo.baseId+'.png'
    }
    return res
  }catch(e){
    log.error(e);
    return {content: 'error getting image'}
  }
}
