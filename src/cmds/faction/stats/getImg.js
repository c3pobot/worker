'use strict'
const getHTML = require('webimg').faction
const { formatWebUnitStats } = require('src/format')
const { getFactionUnits, getImg } = require('src/helpers')

module.exports = async(fInfo = {}, pObj = {}, fInfo2 = {})=>{
  let res = {content: 'Error calculating info'}, webData, factionImage
  let webUnits = await getFactionUnits(fInfo, pObj.rosterUnit, formatWebUnitStats, 40)
  if(webUnits?.length > 0){
    res.content = 'Error getting faction HTML'
    webData = await getHTML.stats(webUnits, {
      player: pObj.name,
      nameKey: fInfo.nameKey+(fInfo2.nameKey ? ' '+fInfo2.nameKey:''),
      footer: 'Data updated ' + (new Date(pObj.updated)).toLocaleString('en-US', {timeZone: 'America/New_York'})
    })
  }
  if(webData?.html){
    res.content = 'Error getting image'
    let windowWidth = 1268
    if(webData.colLimit < 4) windowWidth = +webData.colLimit * 317
    factionImage = await getImg(webData.html, null, windowWidth, false)
  }
  if(factionImage){
    res.content = null
    res.file = factionImage
    res.fileName = 'faction-'+fInfo.baseId+'.png'
  }
  return res
}
