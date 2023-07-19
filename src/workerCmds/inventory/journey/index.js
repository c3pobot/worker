'use strict'
const swgohClient = require('swgohClient')
const { mongo, GetOptValue, GetScreenShot, CheckGuide, ReplyMsg } = require('helpers')
const getUnitMats = require('./getUnitMats')
const getHTML = require('getHTML/inventory/journey')
module.exports = async(obj = {}, opts = [], pObj = {})=>{
  try{
    let msg2send = { content: 'You did not provide a journey guide to look up'}, rosterUnit, guideTemplate, squadData, guideUnits, webData, webHTML, webImg
    let guideId = GetOptValue(opts, 'journey')
    let relicRecipe = await mongo.find('relicRecipeList', {})
    if(guideId){
      msg2send.content = 'error finding guide '+guideId
      guideTemplate = (await mongo.find('guideTemplates', {_id: guideId}))[0]
    }
    if(guideTemplate){
      msg2send.content = 'error calculating roster stats'
      let tempData = await swgohClient('calcRosterStats', pObj?.inventory?.unit)
      if(tempData?.roster) rosterUnit = tempData.roster
    }
    if(rosterUnit){
      msg2send.content = 'Error getting guide requirements'
      squadData = CheckGuide(guideTemplate, rosterUnit)
    }
    if(!relicRecipe) msg2send.content = 'Error getting relic info from db'
    if(squadData?.units && relicRecipe?.length > 0){
      if(squadData?.units?.filter(x=>x.notMet && x.combatType === 1).length > 0){
        guideUnits = squadData.units.filter(x=>x.notMet && x.combatType === 1)
      }else{
        msg2send.content = 'All units are at the required gear/relic level for the event'
      }
    }
    if(guideUnits){
      msg2send.content = 'Error Calcuting data'
      let mats = await getUnitMats( guideUnits, relicRecipe, pObj?.inventory)
      if(mats){
        webData = {
          gear: Object.values(mats?.gear) || [],
          relicMats: Object.values(mats?.relicMats) || [],
          player: pObj?.player?.name,
          nameKey: guideTemplate.name,
          updated: Date.now(),
          includeInventory: true,
          includeImage: false
        }
      }
    }
    if(webData){
      msg2send.content = 'error getting HTML'
      webHTML = getHTML(webData)
    }
    if(webHTML){
      msg2send.content = 'Error getting image'
      webImg = await GetScreenShot(webHTML, obj.id)
    }
    if(webImg){
      msg2send.content = null
      msg2send.file = webImg
      msg2send.fileName = 'journey-guide-gear.png'
    }
    await ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
