'use strict'
const log = require('logger')
const { getTopUnits, getFactionUnits, getImg } = require('src/helpers')
const getHTML = require('webimg').faction
const { formatWebUnitStats } = require('src/format')

module.exports = async(fInfo = {}, pObj = {}, eObj = {}, fInfo2 = {})=>{
  try{
    let [ pUnits, eUnits ] = await Promise.allSettled([
      getFactionUnits(fInfo, pObj.rosterUnit, formatWebUnitStats, 40),
      getFactionUnits(fInfo, eObj.rosterUnit, formatWebUnitStats, 40)
    ])
    if(!pUnits?.value) return { content: 'Error getting player units...' }
    if(!eUnits?.value) return { content: 'Error getting compare player units...' }

    let fUnits = getTopUnits(pUnits.value, eUnits.value)
    if(!fUnits?.player || fUnits?.player?.length == 0) return { content: 'error gettin top units...' }

    let webData = await getHTML.compare(fUnits.player, fUnits.enemy, {
      player: pObj.name,
      enemy: eObj.name,
      nameKey: fInfo.nameKey+(fInfo2.nameKey ? ' '+fInfo2.nameKey:''),
      footer: 'Data updated ' + (new Date(pObj.updated)).toLocaleString('en-US', {timeZone: 'America/New_York'})
    })
    if(!webData?.html) return { content: 'Error getting html...' }

    let windowWidth = 634
    if(webData.colLimit > 1) windowWidth = 1268
    let webImg = await getImg(webData.html, null, windowWidth, false)
    if(!webImg) return { content: 'error getting image...' }

    return { content: null, file: webImg, fileName: 'faction-'+fInfo.baseId+'.png' }

  }catch(e){
    log.error(e);
    return { content: 'error getting image' }
  }
}
