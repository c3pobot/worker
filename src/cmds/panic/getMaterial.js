'use strict'
const mongo = require('mongoclient')
const getHTML = require('webimg').inventory

const { checkUnitMats, getImg } = require('src/helpers')

module.exports = async(obj = {}, squadData = {}, pObj, guideTemplate = {})=>{
  let relicRecipe = await mongo.find('recipe', {type: 'relic'})
  if(!relicRecipe) return { content: msg2send.content = 'Error getting relic info from db' }

  let guideUnits = squadData.units.filter(x=>x.notMet && x.combatType === 1)
  if(!guideUnits) return { content: 'error figuring out info' }
  if(guideUnits?.length == 0) return { content: 'All units are at the required gear/relic level for the event' }

  let mats = await checkUnitMats( guideUnits, relicRecipe, pObj?.inventory)
  if(!mats) return { content: 'error calculating gear data' }

  let webData = {
    material: mats,
    info: {
      player: pObj.name,
      nameKey: guideTemplate.name,
      updated: pObj.updated,
      includeInventory: false
    }
  }
  if(!webData) return { content: 'error calculating data' }

  let webHtml = await getHTML.journey(webData)
  if(!webHtml) return { content: 'error getting html' }

  let webImg = await getImg(webHtml, obj.id, 640, false)
  if(!webImg) return { content: 'error getting image' }

  return { content: null, file: webImg, fileName: 'journey-'+guideTemplate.name+'.png' }
}
