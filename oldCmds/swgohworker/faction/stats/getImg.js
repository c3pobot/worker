'use strict'
const GetHTML = require('webimg').faction
module.exports = async(fInfo = {}, pObj = {}, fInfo2 = {})=>{
  try{
    let res = {content: 'Error calculating info'}, webData, factionImage
    const webUnits = await HP.GetFactionUnits(fInfo, pObj.rosterUnit, FT.FormatWebUnitStats, 40)
    if(webUnits?.length > 0){
      res.content = 'Error getting faction HTML'
      webData = await GetHTML.stats(webUnits, {
        player: pObj.name,
        nameKey: fInfo.nameKey+(fInfo2.nameKey ? ' '+fInfo2.nameKey:''),
        footer: 'Data updated ' + (new Date(pObj.updated)).toLocaleString('en-US', {timeZone: 'America/New_York'})
      })
    }
    if(webData?.html){
      res.content = 'Error getting image'
      let windowWidth = 1268
      if(webData.colLimit < 4) windowWidth = +webData.colLimit * 317
      factionImage = await HP.GetImg(webData.html, windowWidth, false)
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
