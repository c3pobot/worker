'use strict'
const GetSquadInfo = require('./getSquadInfo')
const GetHTML = require('webimg').arena
module.exports = async(pObj = {}, type = 'char')=>{
  try{
    let res = {content: 'Error calculating data'}, webData, arenaImg
    const arena = await GetSquadInfo(pObj?.arena[type]?.squad, pObj.rosterUnit)
    if(arena?.length){
      res.content = 'Error getting HTML'
      webData = await GetHTML(arena, type, {
          name: pObj.name,
          rank: +(pObj?.arena[type]?.rank || 0),
          arena: pObj.arena,
          footer: 'Data updated ' + (new Date(pObj.updated)).toLocaleString('en-US', {timeZone: 'America/New_York'})
        })
    }
    if(webData?.html){
      res.content = 'Error getting image'
      let windowWidth = 50
      arenaImg = await HP.GetImg(webData.html, windowWidth, false)
    }
    if(arenaImg){
      res.content = null
      res.file = arenaImg
      res.fileName = pObj.name+'-arena.png'
    }
    return res
  }catch(e){
    console.error(e);
    return {content: 'error getting image'}
  }
}
