'use strict'
const GetHTML = require('webimg').unit
module.exports = async(uInfo, pObj, gLevel, rLevel, rarity)=>{
  try{
    let res = {content: '**'+uInfo.nameKey+'** is not activated'}, webUnit2, webData, unitImage
    let webUnit1 = pObj.rosterUnit.find(x => x.definitionId.startsWith(uInfo.baseId + ':'))

    if(webUnit1) webUnit2 = await HP.ModifyUnit(uInfo, pObj.rosterUnit, gLevel, rLevel, rarity, true)
    if(webUnit1) webUnit1 = await FT.FormatUnit(uInfo, webUnit1)
    if(webUnit2) webUnit2 = await FT.FormatUnit(uInfo, webUnit2)
    if(webUnit1 && webUnit2){
      res.content = 'Error Calcuting data'
      webData = await GetHTML.compare(webUnit1, webUnit2, uInfo, {footer: pObj.name + '\'s ' + uInfo.nameKey + ' | Data Updated ' + (new Date(pObj.updated)).toLocaleString('en-US', {timeZone: 'America/New_York'})})
    }
    if(webData){
      res.content = 'Error getting image'
      unitImage = await HP.GetImg(webData, 1002, false)
    }
    if(unitImage){
      res.content = null
      res.file = unitImage
      res.fileName = 'unit-'+uInfo.baseId+'.png'
    }
    return res
  }catch(e){
    console.error(e);
    return {content: 'error getting image'}
  }
}
