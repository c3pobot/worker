'use strict'
const GetHTML = require('webimg').squads
module.exports = async(squad = {}, pObj = {}, eObj = {})=>{
  try{
    let res = {content: 'error Calcuting stats'}, htmlArray = [], imgArray = [], squadImg, squadData = {squads: [], info:{tdSpan: 0}}
    const tempArray = squad.squads || []
    if(squad.units) tempArray.push(squad)
    for(let i in tempArray){
      const unitIds = tempArray[i].units?.map(x=>x.baseId)
      const pSquad = await HP.Squads.FormatPlayerSquad(tempArray[i].units, pObj.rosterUnit.filter(x=> unitIds.includes(x.definitionId.split(':')[0])))
      const eSquad = await HP.Squads.FormatPlayerSquad(tempArray[i].units, eObj.rosterUnit.filter(x=> unitIds.includes(x.definitionId.split(':')[0])))
      if(pSquad && eSquad){
        squadData.squads.push({pUnits: pSquad, eUnits: eSquad, note: tempArray[i].note })
        if(pSquad.length > squadData.info.tdSpan) squadData.info.tdSpan = +pSquad.length
        if(eSquad.length > squadData.info.tdSpan) squadData.info.tdSpan = +eSquad.length
      }
    }
    if(squadData.squads.length > 0){
      res.content = 'Error getting HTML'
      squadData.info.header = 'Sqaud '+squad.nameKey+': '+pObj.name+' vs '+eObj.name
      squadData.info.footer = 'Data Updated ' + (new Date(pObj.updated)).toLocaleString('en-US', {timeZone: 'America/New_York'})
      if(squadData.info.tdSpan > 5) squadData.info.tdSpan = 5
      for(let i in squadData.squads){
        if(i == 0) squadData.squads[i].includeHeader = true
        const pHtml = await GetHTML.stats({units: squadData.squads[i].pUnits, note: squadData.squads[i].note, includeHeader: squadData.squads[i].includeHeader}, squadData.info)
        squadData.squads[i].includeHeader = null
        if((+i + 1) == +squadData.squads.length ) squadData.squads[i].includeFooter = true
        const eHtml = await GetHTML.stats({units: squadData.squads[i].eUnits, note: squadData.squads[i].note, includeFooter: squadData.squads[i].includeFooter}, squadData.info)
        if(pHtml && eHtml){
          htmlArray.push(pHtml)
          htmlArray.push(eHtml)
        }
      }
    }
    if(htmlArray.length > 1){
      res.content = 'Error getting images'
      let windowWidth = 698
      if(squadData.info.tdSpan < 5) windowWidth = (139 * +squadData.info.tdSpan )
      for(let i in htmlArray){
        const tempImg = await HP.GetImg(htmlArray[i], null, windowWidth, false)
        if(tempImg) imgArray.push(tempImg)
      }
    }
    if(htmlArray.length == imgArray.length && imgArray.length > 1){
      res.content = 'Error combining images'
      squadImg = await HP.JoinImages(imgArray, {color: { alpha: 1.0, b: 0, g: 0, r: 0 }})
    }
    if(squadImg){
      res.content = null
      res.file = squadImg
      res.fileName = 'squad-stats-'+squad.name+'.png'
    }
    return res
  }catch(e){
    console.error(e);
    return {content: 'error getting image'}
  }
}
