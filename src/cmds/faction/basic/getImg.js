'use strict'
const GetHTML = require('webimg').faction
const { getFactionUnits, getImg } = require('src/helpers')
const { formatWebUnit } = require('src/format')

module.exports = async(fInfo = {}, pObj = {}, fInfo2 = {})=>{
  let res = {content: 'Error calculating info'}, webData, factionImage
  let webUnits = await getFactionUnits(fInfo, pObj.rosterUnit, formatWebUnit, 40)
  if(webUnits?.length > 0){
    res.content = 'Error getting HTML'
    let tempInfo = {
      player: pObj.name,
      enemy: '',
      nameKey: fInfo.nameKey,
      footer: 'Data updated ' + (new Date(pObj.updated)).toLocaleString('en-US', {timeZone: 'America/New_York'})
    }
    if(fInfo2.nameKey) tempInfo.nameKey += ' '+fInfo2.nameKey
    webData = await GetHTML.basic(webUnits, tempInfo)
  }
  if(webData?.html){
    res.content = 'Error getting image'
    let windowWidth = 152
    factionImage = await getImg(webData.html, null, windowWidth, false)
  }
  if(factionImage){
    res.content = null
    res.file = factionImage
    res.fileName = 'faction-'+fInfo.baseId+'.png'
  }
  return res
}
