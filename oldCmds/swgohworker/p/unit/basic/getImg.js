'use strict'
const GetHTML = require('webimg').unit
module.exports = async(uInfo = {}, pObj = {})=>{
  try{
    let res = {content: '**'+uInfo.nameKey+'** is not activated'}, webData, unitImage
    let webUnit = pObj.rosterUnit.find(x => x.definitionId.startsWith(uInfo.baseId + ':'))
    if(webUnit){
      HP.ReportDebug({cmd: 'getUnitImg '+uInfo.nameKey}, 'getting html for '+pObj?.allyCode)
      res.content = 'Error Calcuting data'
      webUnit = await FT.FormatUnit(uInfo, webUnit)
      webData = await GetHTML.stats(webUnit, {footer: pObj.name + '\'s ' + uInfo.nameKey + ' | Data Updated ' + (new Date(pObj.updated)).toLocaleString('en-US', {timeZone: 'America/New_York'})})
    }
    if(webData?.html){
      HP.ReportDebug({cmd: 'getUnitImg '+uInfo.nameKey}, 'getting image for '+pObj?.allyCode)
      res.content = 'Error getting image'
      unitImage = await HP.GetImg(webData.html, (webUnit.equippedStatMod?.length > 0 ? 1118 : 758), false)
      //unitImage = await HP.SaveScreenShot(webData.html, (webUnit.equippedStatMod?.length > 0 ? 1118 : 758), pObj.allyCode+'-'+(Date.now())+'-'+uInfo.baseId, false)
    }
    /*
    if(unitImage){
      res.content = unitImage
    }
    */
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
