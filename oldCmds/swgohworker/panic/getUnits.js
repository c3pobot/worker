'use strict'
const GetHTML = require('webimg').squads
module.exports = async(msg2send = {}, squadData = {}, pObj, guideTemplate)=>{
  try{
    msg2send.content = 'error getting html'
    squadData.info.playerName = pObj.name
    squadData.info.squadName = guideTemplate.name
    squadData.info.header = pObj.name+'\'s units for '+guideTemplate.name+' Journey Guide'
    squadData.info.footer = 'Data Updated ' + (new Date(pObj.updated)).toLocaleString('en-US', {timeZone: 'America/New_York'})

    let html = await GetHTML.units(squadData, squadData.info)
    return html
  }catch(e){
    console.error(e);
  }
}
