'use strict'
const GetHTML = require('webimg').squads
module.exports = async(squad = {}, pObj = {}, includeLinks)=>{
  try{
    let res = {content: 'Error Calcuting stats'}, htmlArray =[], imgArray = [], squadImg
    const tempArray = squad.squads || []
    if(squad.units) tempArray.push(squad)
    const squadData = await HP.Squads.CheckSquads(tempArray, pObj.rosterUnit, false)
    if(squadData?.squads?.length > 0 && squadData?.info){
      res.content = 'Error getting HTML'
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
      //mongo.set('webTemp', {_id: 'panic'}, {data: squadData.squads[0], info: squadData.info})
      //redis.set('w-squad', {data: squadData.squads[0], opt: squadData.info})
      for(let i in squadData.squads){
        if(i == 0) squadData.squads[i].includeHeader = true
        if((+i + 1) == +squadData.squads.length ) squadData.squads[i].includeFooter = true
        const squadHtml = await GetHTML.units(squadData.squads[i], squadData.info)
        if(squadHtml) htmlArray.push(squadHtml)
      }
    }
    if(htmlArray?.length > 0){
      res.content = 'Error getting image'
      let windowWidth = 728
      if(squadData.info.unitCount < 5) windowWidth = (143 * (+squadData.info.unitCount)) + 2 + (+squadData.info.unitCount * 2)

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
      res.fileName = 'squad-'+squad.name+'.png'
      if(includeLinks == 'yes'){
        if(squadData.info?.links?.length > 0){
          for(let i in squadData.info.links){
            if(i == 0){
              res.content = squadData.info.links[i]+'\n'
            }else{
              res.content += '<'+squadData.info.links[i]+'>\n'
            }
          }
        }
      }
    }
    return res
  }catch(e){
    console.error(e);
    return {content: 'error getting image'}
  }
}
