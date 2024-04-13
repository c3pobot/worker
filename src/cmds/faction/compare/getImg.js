'use strict'
const { getTopUnits, getFactionUnits, getImg } = require('src/helpers')
const getHTML = require('webimg').faction
const { formatWebUnitStats } = require('src/format')

module.exports = async(fInfo = {}, pObj = {}, eObj = {}, fInfo2 = {})=>{
  try{
    let res = {content: 'error calculating stats'}, fUnits, webData, factionImage
    let pUnits = await getFactionUnits(fInfo, pObj.rosterUnit, formatWebUnitStats, 40)
    let eUnits = await getFactionUnits(fInfo, eObj.rosterUnit, formatWebUnitStats, 40)
    if(pUnits?.length > 0) fUnits = getTopUnits(pUnits, eUnits);
    if(fUnits?.player?.length > 0){
      res.content = 'Error getting faction HTML'
      webData = await getHTML.compare(fUnits.player, fUnits.enemy, {
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
      factionImage = await getImg(webData.html, null, windowWidth, false)
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
