'use strict'
const log = require('logger')
const getHTML = require('webimg').squads
const { squads, joinImages, getImg } = require('src/helpers')
const { formatPlayerSquad } = require('src/helpers/squads')

module.exports = async(squad = {}, pObj = {}, eObj = {})=>{
  try{
    let msg2send = {content: 'error Calcuting stats'}, htmlArray = [], imgArray = [], squadImg, squadData = {squads: [], info:{tdSpan: 0}}
    let tempArray = squad.squads || []
    if(squad.units) tempArray.push(squad)
    for(let i in tempArray){
      let unitIds = tempArray[i].units?.map(x=>x.baseId)
      let pSquad = await formatPlayerSquad(tempArray[i].units, pObj.rosterUnit.filter(x=> unitIds.includes(x.definitionId.split(':')[0])))
      let eSquad = await formatPlayerSquad(tempArray[i].units, eObj.rosterUnit.filter(x=> unitIds.includes(x.definitionId.split(':')[0])))
      if(pSquad && eSquad){
        squadData.squads.push({pUnits: pSquad, eUnits: eSquad, note: tempArray[i].note })
        if(pSquad.length > squadData.info.tdSpan) squadData.info.tdSpan = +pSquad.length
        if(eSquad.length > squadData.info.tdSpan) squadData.info.tdSpan = +eSquad.length
      }
    }
    if(!squadData || !squadData?.info || !squadData?.squads || squadData?.squads?.length === 0) return msg2send
    msg2send.content = 'Error getting HTML'
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
    if(htmlArray.length > 1){
      msg2send.content = 'Error getting images'
      let windowWidth = 698
      if(squadData.info.tdSpan < 5) windowWidth = (139 * +squadData.info.tdSpan )
      for(let i in htmlArray){
        let tempImg = await getImg(htmlArray[i], null, windowWidth, false)
        if(tempImg) imgArray.push(tempImg)
      }
    }
    if(htmlArray.length == imgArray.length && imgArray.length > 1){
      msg2send.content = 'Error combining images'
      squadImg = await joinImages(imgArray, {color: { alpha: 1.0, b: 0, g: 0, r: 0 }})
    }
    if(squadImg){
      msg2send.content = null
      msg2send.file = squadImg
      msg2send.fileName = 'squad-stats-'+squad.name+'.png'
    }
    return msg2send
  }catch(e){
    log.error(e);
    return {content: 'error getting image'}
  }
}
