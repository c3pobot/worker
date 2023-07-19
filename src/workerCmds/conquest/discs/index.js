'use strict'
const { GetOptValue, GetScreenShot, ReplyMsg } = require('helpers')
const getDiscsDef = require('./getDiscDef')
const getHTML = require('getHTML/conquest/disc')
module.exports = async(obj, opt = [], pObj = {})=>{
  try{
    let webHTML, webImg, msg2send = {content: 'Error getting disc info'}
    let discOpt = GetOptValue(opt, 'option', 1)
    discOpt = +discOpt
    let webData = {
      name: pObj.name,
      allyCode: pObj.allyCode,
      guild: pObj.guild,
      updated: pObj?.updated
    }
    if(discOpt === 1 || discOpt === 2) webData.equippedDisc = await getDiscsDef(pObj.conquestStatus.equippedArtifact, true)
    if(discOpt === 1 || discOpt === 3) webData.unequppedDisc = await getDiscsDef(pObj.conquestStatus.unequippedArtifact, false)
    if(webData.equippedDisc || webData.unequppedDisc){
      msg2send.content = 'Error getting disc HTML'
      webHTML = getHTML(webData)
    }
    if(webHTML){
      msg2send.content = 'Error getting disc image'
      webImg = await GetScreenShot(webHTML, obj.id)
    }
    if(webImg){
      msg2send.content = null
      msg2send.file = webImg
      msg2send.fileName = 'conquest-disc.png'
    }
    await ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
