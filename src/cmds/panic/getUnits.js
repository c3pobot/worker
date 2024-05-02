'use strict'
const getHTML = require('webimg').squads

const { getImg } = require('src/helpers')

module.exports = async(obj = {}, squadData = {}, pObj, guideTemplate = {})=>{
  squadData.info.playerName = pObj.name
  squadData.info.squadName = guideTemplate.name
  squadData.info.header = pObj.name+'\'s units for '+guideTemplate.name+' Journey Guide'
  squadData.info.footer = 'Data Updated ' + (new Date(pObj.updated)).toLocaleString('en-US', {timeZone: 'America/New_York'})
  let webHtml = await getHTML.units(squadData, squadData.info)
  if(!webHtml) return { content: 'error getting html' }

  let windowWidth = 728
  if(squadData.info.unitCount < 5) windowWidth = (143 * (+squadData.info.unitCount)) + 2 + (+squadData.info.unitCount * 2)
  let webImg = await getImg(guideHTML, obj.id, windowWidth, false)
  if(!webImg) return { content: 'error getting image' }

  return { content: null, file: webImg, fileName: 'journey-'+guideTemplate.name+'.png' }
}
