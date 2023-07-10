'use strict'
const GetHTML = require('webimg').faction
module.exports = async(fInfo = {}, pObj = {}, fInfo2 = {})=>{
  try{
    let res = {content: 'Error calculating info'}, webData, factionImage
    const webUnits = await HP.GetFactionUnits(fInfo, pObj.rosterUnit, FT.FormatWebUnit, 40)
    if(webUnits?.length > 0){
      res.content = 'Error getting HTML'
      const tempInfo = {
        player: pObj.name,
        enemy: '',
        nameKey: fInfo.nameKey,
        footer: 'Data updated ' + (new Date(pObj.updated)).toLocaleString('en-US', {timeZone: 'America/New_York'})
      }
      if(fInfo2.nameKey) tempInfo.nameKey += ' '+fInfo2.nameKey
      redis.set('w-faction', {data: webUnits, info: tempInfo})
      webData = await GetHTML.basic(webUnits, tempInfo)
    }
    if(webData?.html){
      res.content = 'Error getting image'
      let windowWidth = 152
      //if(webData.colLimit) windowWidth = (152 * +webData.colLimit)
      factionImage = await HP.GetScreenShot(webData.html, windowWidth, false)
    }
    if(factionImage){
      res.content = null
      res.file = factionImage
      res.fileName = 'faction-'+fInfo.baseId+'.png'
    }
    return res
  }catch(e){
    console.error(e);
    return {content: 'error getting image'}
  }
}
