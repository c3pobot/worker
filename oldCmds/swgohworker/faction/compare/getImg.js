'use strict'
const { GetTopUnits } = require('../helpers')
const GetHTML = require('webimg').faction
module.exports = async(fInfo = {}, pObj = {}, eObj = {}, fInfo2 = {})=>{
  try{
    let res = {content: 'error calculating stats'}, fUnits, webData, factionImage
    const pUnits = await HP.GetFactionUnits(fInfo, pObj.rosterUnit, FT.FormatWebUnitStats, 40)
    const eUnits = await HP.GetFactionUnits(fInfo, eObj.rosterUnit, FT.FormatWebUnitStats, 40)
    if(pUnits?.length > 0) fUnits = await GetTopUnits(pUnits, eUnits);
    if(fUnits?.player?.length > 0){
      res.content = 'Error getting faction HTML'
      webData = await GetHTML.compare(fUnits.player, fUnits.enemy, {
        player: pObj.name,
        enemy: eObj.name,
        nameKey: fInfo.nameKey+(fInfo2.nameKey ? ' '+fInfo2.nameKey:''),
        footer: 'Data updated ' + (new Date(pObj.updated)).toLocaleString('en-US', {timeZone: 'America/New_York'})
      })
    }
    if(webData?.html){
      res.content = 'Error getting image'
      let windowWidth = 634
      if(webData.colLimit > 1) windowWidth = 1268
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
