'use strict'
const mongo = require('mongoclient')
const getHTML = require('webimg').inventory
const { getOptValue, checkGuide, checkUnitMats, getImg } = require('src/helpers')

module.exports = async(obj = {}, opts = [], pObj = {})=>{
  let msg2send = { content: 'You did not provide a journey guide to look up'}
  let guideId = getOptValue(opts, 'journey')
  if(!guideId) return msg2send

  let relicRecipe = await mongo.find('recipe', {type: 'relic'})
  if(!relicRecipe || relicRecipe?.length === 0) return { content: 'Error getting relic info from db' }

  let guideTemplate = (await mongo.find('guideTemplates', {_id: guideId}))[0]
  if(!guideTemplate) return { content: 'error finding guide '+guideId }

  let squadData = await checkGuide(guideTemplate, pObj?.inventory?.unit)
  if(!squadData?.units) return { content: 'Error getting guide requirements' }

  let guideUnits = squadData.units.filter(x=>x.notMet && x.combatType === 1)
  if(guideUnits?.length === 0) return { content: 'All units are at the required gear/relic level for the event'}

  let mats = await checkUnitMats( guideUnits, relicRecipe, pObj?.inventory)
  if(!mats) return { content: 'Error Calcuting data'}
  let webData = {
    material: mats,
    info: {
      player: pObj?.player?.name,
      nameKey: guideTemplate.name,
      updated: Date.now(),
      includeInventory: true
    }
  }
  let imgHtml = await GetHTML.journey(webData)
  if(!imgHtml) return { content: 'error getting HTML' }

  let webImg = await HP.GetImg(imgHtml, obj.id, 640, false)
  if(!webImg) return { content: 'Error getting image'}

  msg2send.content = null
  msg2send.file = webImg
  msg2send.fileName = 'journey-guide-gear.png'
  return msg2send
}
