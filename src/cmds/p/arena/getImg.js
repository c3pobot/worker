'use strict'
const log = require('logger')
const getSquadInfo = require('./getSquadInfo')
const getHTML = require('webimg').arena
const { getImg } = require('src/helpers')

module.exports = async(pObj = {}, type = 'char')=>{
  try{
    let res = {content: 'Error calculating data'}, webData, arenaImg
    let arena = await getSquadInfo(pObj?.arena[type]?.squad, pObj.rosterUnit)
    if(arena?.length){
      res.content = 'Error getting HTML'
      webData = await getHTML(arena, type, {
          name: pObj.name,
          rank: +(pObj?.arena[type]?.rank || 0),
          arena: pObj.arena,
          footer: 'Data updated ' + (new Date(pObj.updated)).toLocaleString('en-US', {timeZone: 'America/New_York'})
        })
    }
    if(webData?.html){
      res.content = 'Error getting image'
      let windowWidth = 50
      arenaImg = await getImg(webData.html, null, windowWidth, false)
    }
    if(arenaImg){
      res.content = null
      res.file = arenaImg
      res.fileName = pObj.name+'-arena.png'
    }
    return res
  }catch(e){
    log.error(e);
    return {content: 'error getting image'}
  }
}
