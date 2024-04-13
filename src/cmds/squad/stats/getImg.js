'use strict'
const GetHTML = require('webimg').squads
module.exports = async(squad = {}, pObj = {})=>{
  try{
    let res = {content: 'Error Calcuting stats'}, htmlArray = [], squadImg, imgArray = [], squadData = {squads: [], info:{tdSpan: 0}}
    const tempArray = squad.squads || []
    if(squad.units) tempArray.push(squad)
    for(let i in tempArray){
      const unitIds = squad.units.map(x=>x.baseId)
      const squadUnits = pObj.rosterUnit.filter(x=> unitIds.includes(x.definitionId.split(':')[0]))
      const tempSquad = await HP.Squads.FormatPlayerSquad(squad.units, squadUnits)
      if(tempSquad){
        squadData.squads.push({units: tempSquad, note: tempArray[i].note})
        if(tempSquad?.length > squadData.info.tdSpan) squadData.info.tdSpan = +tempSquad.length
      }
    }
    if(squadData.squads.length > 0){
      res.content = 'Error getting HTML'
      squadData.info.playerName = pObj.name
      squadData.info.squadName = squad.nameKey
      squadData.info.footer = 'Data Updated ' + (new Date(pObj.updated)).toLocaleString('en-US', {timeZone: 'America/New_York'})
      if(squadData.info.tdSpan > 5) squadData.info.tdSpan = 5
      for(let i in squadData.squads){
        if(i == 0) squadData.squads[i].includeHeader = true
        if((+i + 1) == +squadData.squads.length ) squadData.squads[i].includeFooter = true
        const squadHtml = await GetHTML.stats(squadData.squads[i], squadData.info)
        if(squadHtml) htmlArray.push(squadHtml)
      }
    }
    if(htmlArray?.length > 0){
      res.content = 'Error getting image'
      let windowWidth = 698
      if(squadData.info.tdSpan < 5) windowWidth = (139 * +squadData.info.tdSpan )
      for(let i in htmlArray){
        const tempImg = await HP.GetImg(htmlArray[i], null, windowWidth, false)
        if(tempImg) imgArray.push(tempImg)
      }
    }
    if(imgArray?.length > 0){
      res.content = 'Error combining images'
      if(imgArray?.length == 1){
        squadImg = imgArray[0]
      }else{
        squadImg = await HP.JoinImages(imgArray, {color: { alpha: 1.0, b: 0, g: 0, r: 0 }})
      }
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
