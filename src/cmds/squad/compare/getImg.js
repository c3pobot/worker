'use strict'
const log = require('logger')
const getHTML = require('webimg').squads
const { squads, joinImages, getImg } = require('src/helpers')
const { formatPlayerSquad } = require('src/helpers/squads')

module.exports = async(squad = {}, pObj = {}, eObj = {})=>{
  try{
    let tempArray = squad.squads || []
    if(squad.units) tempArray.push(squad)
    if(tempArray.length == 0) return { content: `there are no squads for ${squad.nameKey}` }

    let squadData = { squads: [], info: { tdSpan: 0 } }
    for(let i in tempArray){
      let unitIds = tempArray[i].units?.map(x=>x.baseId)
      let [ pSquad, eSquad] = await Promise.allSettled([
        formatPlayerSquad(tempArray[i].units, pObj.rosterUnit.filter(x=> unitIds.includes(x.definitionId.split(':')[0]))),
        formatPlayerSquad(tempArray[i].units, eObj.rosterUnit.filter(x=> unitIds.includes(x.definitionId.split(':')[0])))
      ])
      if(!pSquad?.value || !eSquad?.value) return { content: 'Error formating squads' }

      squadData.squads.push({ pUnits: pSquad.value, eUnits: eSquad.value, note: tempArray[i].note })
      if(pSquad.value.length > squadData.info.tdSpan) squadData.info.tdSpan = +pSquad.value.length
      if(eSquad.value.length > squadData.info.tdSpan) squadData.info.tdSpan = +eSquad.value.length
    }
    if(!squadData || !squadData?.info || !squadData?.squads || squadData?.squads?.length === 0) return { content: 'error Calcuting stats' }


    let htmlArray = []
    squadData.info.header = 'Sqaud '+squad.nameKey+': '+pObj.name+' vs '+eObj.name
    squadData.info.footer = 'Data Updated ' + (new Date(pObj.updated)).toLocaleString('en-US', {timeZone: 'America/New_York'})
    if(squadData.info.tdSpan > 5) squadData.info.tdSpan = 5
    for(let i in squadData.squads){
      if(i == 0) squadData.squads[i].includeHeader = true
      let pHtml = await getHTML.stats({units: squadData.squads[i].pUnits, note: squadData.squads[i].note, includeHeader: squadData.squads[i].includeHeader}, squadData.info)
      squadData.squads[i].includeHeader = null
      if((+i + 1) == +squadData.squads.length ) squadData.squads[i].includeFooter = true
      let eHtml = await getHTML.stats({units: squadData.squads[i].eUnits, note: squadData.squads[i].note, includeFooter: squadData.squads[i].includeFooter}, squadData.info)
      if(pHtml && eHtml){
        htmlArray.push(pHtml)
        htmlArray.push(eHtml)
      }
    }
    if(!htmlArray || htmlArray?.length == 0) return { content: 'error getting html' }

    let  imgArray = []

    let windowWidth = 698
    if(squadData.info.tdSpan < 5) windowWidth = (139 * +squadData.info.tdSpan )
    for(let i in htmlArray){
      let tempImg = await getImg(htmlArray[i], null, windowWidth, false)
      if(tempImg) imgArray.push(tempImg)
    }
    if(!imgArray || imgArray?.length !== htmlArray.length) return { content: 'error getting images' }

    let webimg
    if(imgArray.length == 1) webimg = imgArray[0]
    if(imgArray.length > 1) webimg = await joinImages(imgArray, {color: { alpha: 1.0, b: 0, g: 0, r: 0 }})
    let webImg = await joinImages(imgArray, {color: { alpha: 1.0, b: 0, g: 0, r: 0 }})
    if(!webimg) return { content: 'error joining images' }

    return { content: null, file: webimg, fileName: 'squad-stats-'+squad.nameKey+'.png' }
  }catch(e){
    log.error(e);
    return {content: 'error getting image'}
  }
}
