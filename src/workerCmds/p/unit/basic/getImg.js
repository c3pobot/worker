'use strict'
const { configMaps } = require('helpers/configMaps')
const getHTML = require('helpers/getHTML/unitStats')
const { mongo, GetScreenShot } = require('helpers')
module.exports = async(obj, pObj = {}, baseId)=>{
  try{
    let msg2send = { content: +configMaps.UnitMap[baseId].nameKey+' is not activated'}, webHTML, webImg
    if(pObj.roster[baseId]){
      msg2send.content = 'error getting html'
      mongo.set('webTemp', {_id: 'unitTest'}, {data: {player: pObj.name, updated: pObj.updated, unit: pObj.roster[baseId]}})
      webHTML = getHTML({player: pObj.name, updated: pObj.updated, unit: pObj.roster[baseId]})
    }
    if(webHTML){
      msg2send.content = 'error getting screen shot'
      webImg = await GetScreenShot(webHTML, obj.id)
    }
    if(webImg){
      msg2send.content = null
      msg2send.file = webImg
      msg2send.fileName = 'unit-'+baseId+'.png'
    }
    return msg2send
  }catch(e){
    throw(e)
  }
}
