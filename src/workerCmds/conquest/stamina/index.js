'use strict'
const { GetScreenShot, ReplyMsg } = require('helpers')
const GetUnitStamina = require('./getUnitStamina')
const getHTML = require('getHTML/conquest/stamina')
module.exports = async(obj, opt = [], pObj = {})=>{
  try{
    let webHTML, webImg, msg2send = {content: 'Error getting stamina info'}
    const webData = {
      name: pObj.name,
      allyCode: pObj.allyCode,
      guild: pObj.guild,
      updated: pObj?.updated,
      units: []
    }
    webData.units = GetUnitStamina(pObj)
    if(webData?.units){
      msg2send.content = 'error getting stamina HTML'
      webHTML = getHTML(webData)
    }
    if(webHTML){
      msg2send.content = 'error getting stamina image'
      webImg = await GetScreenShot(webHTML, obj.id)
    }
    if(webImg){
      msg2send.content = null,
      msg2send.file = webImg
      msg2send.fileName = 'conquest-stamina.png'
    }
    await ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
