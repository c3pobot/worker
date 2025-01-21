'use strict'
const log = require('logger')
const getHTML = require('webimg').faction
const { formatWebUnitStats } = require('src/format')
const { getFactionUnits, getImg } = require('src/helpers')

module.exports = async(fInfo = {}, pObj = {}, fInfo2 = {}, eInfo = {})=>{
  try{
    let webUnits = await getFactionUnits(fInfo, pObj.rosterUnit, formatWebUnitStats, 40)
    if(!webUnits || webUnits?.length == 0) return { content: 'Error calculating info' }

    let tempInfo = {
      player: pObj.name,
      enemy: '',
      nameKey: fInfo.nameKey,
      footer: 'Data updated ' + (new Date(pObj.updated)).toLocaleString('en-US', {timeZone: 'America/New_York'})
    }
    if(fInfo2.nameKey) tempInfo.nameKey += ' '+fInfo2.nameKey
    if(eInfo.nameKey) tempInfo.nameKey += ` Excluding ${eInfo.nameKey}`
    let webData = await getHTML.stats(webUnits, tempInfo)
    if(!webData?.html) return { content: 'error getting html...' }

    let windowWidth = 1268
    if(webData.colLimit < 4) windowWidth = +webData.colLimit * 317
    let webImg = await getImg(webData.html, null, windowWidth, false)
    if(!webImg) return { content: 'error getting image...' }

    return { content: null, file: webImg, fileName: 'faction-'+fInfo.baseId+'.png' }
  }catch(e){
    log.error(e)
    return { content: 'error getting image' }
  }
}
