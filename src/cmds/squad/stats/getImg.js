'use strict'
const log = require('logger')
const getHTML = require('webimg').squads
const { formatPlayerSquad } = require('src/helpers/squads')
const { getImg, joinImages } = require('src/helpers')

module.exports = async(squad = {}, pObj = {})=>{
  try{
    let tempArray = squad.squads || []
    if(squad.units) tempArray.push(squad)
    if(!tempArray || tempArray?.length == 0) return { content: 'there are not squads to check against' }

    let squadData = { squads: [], info: { tdSpan: 0 } }
    for(let i in tempArray){
      let unitIds = tempArray[i]?.units?.map(x=>x.baseId)
      let squadUnits = pObj.rosterUnit.filter(x=> unitIds.includes(x.definitionId.split(':')[0]))
      let tempSquad = await formatPlayerSquad(tempArray[i].units, squadUnits)
      if(!tempSquad) continue
      squadData.squads.push({units: tempSquad, note: tempArray[i].note})
      if(tempSquad?.length > squadData.info.tdSpan) squadData.info.tdSpan = +tempSquad.length
    }
    if(!squadData || !squadData?.info || !squadData?.squads || squadData?.squads?.length === 0) return { content: 'Error Calcuting stats' }
    squadData.info.playerName = pObj.name
    squadData.info.squadName = squad.nameKey
    squadData.info.footer = 'Data Updated ' + (new Date(pObj.updated)).toLocaleString('en-US', {timeZone: 'America/New_York'})
    if(squadData.info.tdSpan > 5) squadData.info.tdSpan = 5

    let htmlArray = []
    for(let i in squadData.squads){
      if(i == 0) squadData.squads[i].includeHeader = true
      if((+i + 1) == +squadData.squads.length ) squadData.squads[i].includeFooter = true
      let squadHtml = await getHTML?.stats(squadData.squads[i], squadData.info)
      if(squadHtml) htmlArray.push(squadHtml)
    }
    if(htmlArray?.length == 0) return { content: 'error getting html' }

    let windowWidth = 698, imgArray = []
    if(squadData.info.tdSpan < 5) windowWidth = (139 * +squadData.info.tdSpan )
    for(let i in htmlArray){
      let tempImg = await getImg(htmlArray[i], null, windowWidth, false)
      if(tempImg) imgArray.push(tempImg)
    }

    if(imgArray?.length == 0) return { content: 'error getting images' }

    let webImg
    if(imgArray?.length == 1) webImg = imgArray[0]
    if(imgArray.length > 1) webImg = await joinImages(imgArray, {color: { alpha: 1.0, b: 0, g: 0, r: 0 }})
    if(!webImg) return { content: 'error joining images.' }

    return { content: null, file: webImg, fileName: 'squad-stats-'+squad.nameKey+'.png' }
  }catch(e){
    log.error(e);
    return {content: 'error getting image'}
  }
}
