'use strict'
const GetHTML = require('webimg').inventory
module.exports = async(msg2send = {}, squadData = {}, pObj, guideTemplate)=>{
  try{
    let guideUnits, webData, html
    let relicRecipe = await mongo.find('recipe', {type: 'relic'})
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
      let mats = await HP.CheckUnitMats( guideUnits, relicRecipe, pObj?.inventory)
      if(mats){
        webData = {
          material: mats,
          info: {
            player: pObj.name,
            nameKey: guideTemplate.name,
            updated: pObj.updated,
            includeInventory: false
          }
        }
      }
    }
    if(webData){
      msg2send.content = 'error getting HTML'
      html = await GetHTML.journey(webData)
    }
    return html
  }catch(e){
    console.error(e);
  }
}
