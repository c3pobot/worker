'use strict'
const log = require('logger')
const getSquadInfo = require('./getSquadInfo')
const getHTML = require('webimg').arena

const { getImg } = require('src/helpers')

module.exports = async(pObj = {}, type = 'ship')=>{
  try{
    let arena = await getSquadInfo(pObj?.arena[type]?.squad, pObj.rosterUnit)
    if(!arena || arena?.length == 0) return { content: 'error calculating data' }

    let webData = await getHTML(arena, type, {
        name: pObj.name,
        rank: +(pObj?.arena[type]?.rank || 0),
        arena: pObj.arena,
        footer: 'Data updated ' + (new Date(pObj.updated)).toLocaleString('en-US', {timeZone: 'America/New_York'})
      })
    if(!webData?.html) return { content: 'error getting html' }

    let webImg = await getImg(webData.html, null, 50, false)
    if(!webImg) return { content: 'error getting image' }

    return { content: null, file: webImg, fileName: pObj.name+'-arena.png' }
  }catch(e){
    log.error(e);
    return {content: 'error getting image'}
  }
}
