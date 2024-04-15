'use strict'
const log = require('logger')
const getHTML = require('webimg').squads
const { getImg, joinImages } = require('src/helpers')
const { checkSquads } = require('src/helpers/squads')
module.exports = async(squad = {}, pObj = {}, includeLinks)=>{
  try{
    let msg2send = {content: 'Error Calcuting stats'}, htmlArray =[], imgArray = [], squadImg
    let tempArray = squad.squads || []
    if(squad.units) tempArray.push(squad)
    let squadData = await checkSquads(tempArray, pObj.rosterUnit, false)
    if(!squadData || !squadData?.info || !squadData?.squads || squadData?.squads?.length === 0) return msg2send
    msg2send.content = 'Error getting HTML'
    squadData.info.playerName = pObj.name
    squadData.info.squadName = squad.nameKey
    squadData.info.footer = 'Data Updated ' + (new Date(pObj.updated)).toLocaleString('en-US', {timeZone: 'America/New_York'})

    if(squadData.info?.showStats){
      squadData.info.tdSpan = 10
      squadData.info.colLimit = 2
      if(squadData.info.unitCount < 2){
        squadData.info.tdSpan = 5
        squadData.info.colLimit = 1
      }
    }else{
      if(squadData.unitCount < 5){
        squadData.info.tdSpan = +squadData.info.unitCount
        squadData.info.colLimit = +squadData.info.unitCount
      }
    }
    for(let i in squadData.squads){
      if(i == 0) squadData.squads[i].includeHeader = true
      if((+i + 1) == +squadData.squads.length ) squadData.squads[i].includeFooter = true
      let squadHtml = await getHTML?.units(squadData.squads[i], squadData.info)
      if(squadHtml) htmlArray.push(squadHtml)
    }
    if(htmlArray?.length > 0){
      msg2send.content = 'Error getting image'
      let windowWidth = 728
      if(squadData.info.unitCount < 5) windowWidth = (143 * (+squadData.info.unitCount)) + 2 + (+squadData.info.unitCount * 2)

      for(let i in htmlArray){
        let tempImg = await getImg(htmlArray[i], null, windowWidth, false)
        if(tempImg) imgArray.push(tempImg)
      }
    }
    if(imgArray?.length > 0){
      msg2send.content = 'Error combining images'
      if(imgArray?.length == 1){
        squadImg = imgArray[0]
      }else{
        squadImg = await joinImages(imgArray, {color: { alpha: 1.0, b: 0, g: 0, r: 0 }})
      }
    }
    if(squadImg){
      msg2send.content = null
      msg2send.file = squadImg
      msg2send.fileName = 'squad-'+squad.name+'.png'
      if(includeLinks == 'yes'){
        if(squadData.info?.links?.length > 0){
          for(let i in squadData.info.links){
            if(i == 0){
              msg2send.content = squadData.info.links[i]+'\n'
            }else{
              msg2send.content += '<'+squadData.info.links[i]+'>\n'
            }
          }
        }
      }
    }
    return msg2send
  }catch(e){
    log.error(e)
    return {content: 'error getting image'}
  }
}
