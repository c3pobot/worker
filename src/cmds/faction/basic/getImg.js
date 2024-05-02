'use strict'
const log = require('logger')
const getHTML = require('webimg').faction
const { getFactionUnits, getImg } = require('src/helpers')
const { formatWebUnit } = require('src/format')

module.exports = async(fInfo = {}, pObj = {}, fInfo2 = {})=>{
  try{
    let webUnits = await getFactionUnits(fInfo, pObj.rosterUnit, formatWebUnit, 40)
    if(!webUnits || webUnits?.length == 0) return { content: 'Error calculating info' }

    let tempInfo = {
      player: pObj.name,
      enemy: '',
      nameKey: fInfo.nameKey,
      footer: 'Data updated ' + (new Date(pObj.updated)).toLocaleString('en-US', {timeZone: 'America/New_York'})
    }
    if(fInfo2.nameKey) tempInfo.nameKey += ' '+fInfo2.nameKey
    let webData = await getHTML.basic(webUnits, tempInfo)
    if(!webData) return { content: 'error getting html...' }

    let webImg = await getImg(webData.html, null, 152, false)
    if(!webImg) return { content: 'error getting image...' }

    return { content: null, file: webImg, fileName: 'faction-'+fInfo.baseId+'.png' }
  }catch(e){
    log.error(e)
    return { content: 'error getting image' }
  }
}
