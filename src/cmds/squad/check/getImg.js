'use strict'
const log = require('logger')
const getHTML = require('webimg').squads
const { getImg, joinImages } = require('src/helpers')
const { checkSquads } = require('src/helpers/squads')
module.exports = async(squad = {}, pObj = {}, includeLinks)=>{
  try{
    let tempArray = squad.squads || []
    if(squad.units) tempArray.push(squad)
    if(!tempArray || tempArray?.length == 0) return { content: 'there are not squads to check against' }

    let squadData = await checkSquads(tempArray, pObj.rosterUnit, false)
    if(!squadData || !squadData?.info || !squadData?.squads || squadData?.squads?.length === 0) return { content: 'Error Calcuting stats' }

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
    let htmlArray = []
    for(let i in squadData.squads){
      if(i == 0) squadData.squads[i].includeHeader = true
      if((+i + 1) == +squadData.squads.length ) squadData.squads[i].includeFooter = true
      let squadHtml = await getHTML?.units(squadData.squads[i], squadData.info)
      if(squadHtml) htmlArray.push(squadHtml)
    }
    if(htmlArray?.length == 0) return { content: 'error getting html' }

    let windowWidth = 728, imgArray = []
    if(squadData.info.unitCount < 5) windowWidth = (143 * (+squadData.info.unitCount)) + 2 + (+squadData.info.unitCount * 2)

    for(let i in htmlArray){
      let tempImg = await getImg(htmlArray[i], null, windowWidth, false)
      if(tempImg) imgArray.push(tempImg)
    }
    if(imgArray?.length == 0) return { content: 'error getting images' }

    let content
    if(includeLinks == 'yes' && squadData.info?.links?.length > 0){
      for(let i in squadData.info.links){
        if(i == 0){
          content = squadData.info.links[i]+'\n'
        }else{
          content += '<'+squadData.info.links[i]+'>\n'
        }
      }
    }
    if(imgArray?.length == 1) return { content: content, file: imgArray[0], fileName: 'squad-'+squad.name+'.png' }

    let squadImg = await joinImages( imgArray, {color: { alpha: 1.0, b: 0, g: 0, r: 0 }})
    if(!squadImg) return { content: 'error joining images' }

    return { content: content, file: squadImg, fileName: 'squad-'+squad.name+'.png' }
  }catch(e){
    log.error(e)
    return {content: 'error getting image'}
  }
}
