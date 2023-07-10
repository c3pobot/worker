'use strict'
const { GetScreenShot } = require('helpers')
const getHTML = require('helpers/getHTML/unitStats')
module.exports = async(obj = {}, pObj = {}, eObj = {}, baseId)=>{
  try{
    let msg2send = { content: 'error getting html'}, webImg, updated = +pObj.updated
    if(+eObj.updated < updated) updated = +eObj.updated
    let webHTML = getHTML({player: pObj.name, player2: eObj.name, unit: pObj.roster[baseId], unit2: eObj.roster[baseId], updated: updated })
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
