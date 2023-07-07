'use strict'
const { configMaps } = require('helpers/configMaps')
const { mongo, GetAllyCodeObj, FindUnit, GetOptValue, GetScreenShot, ReplyMsg } = require('helpers')
const getHTML = require('./getHTML')
const swgohClient = require('swgohClient')
module.exports = async(obj = {}, opt = [])=>{
  try{
    let dObj, allyCode, pObj, webHTML, webImg, msg2send = {content: 'error finding the requested unit'}
    let baseId = obj.confirm?.baseId
    if(!baseId) baseId = await FindUnit(obj, opt, 'unit')
    if(baseId){
      msg2send.content = 'You do not have allycode linked to discordId'
      dObj = await GetAllyCodeObj(obj, opt)
    }
    if(dObj?.allyCode) allyCode = dObj.allyCode
    if(dObj?.mentionError) msg2send.content = 'that user does not have allyCode linked to discordId'
    if(allyCode && !dObj.mentionError){
      msg2send.content = '**'+allyCode+'** is an invalid allyCode'
      pObj = await swgohClient('fetchPlayer', { allyCode: allyCode.toString(), project: { roster: { [baseId]: 1 }, updated: 1, name: 1 }})
      if(pObj?.name && !pObj.roster[baseId]) msg2send.content = pObj.name+' does not have '+configMaps.UnitMap[baseId].nameKey+' activated'
    }
    if(pObj?.roster[baseId]){
      msg2send.content = 'error getting html'
      mongo.set('webTemp', {_id: 'unitTest'}, {player: pObj.name, updated: pObj.updated, unit: pObj.roster[baseId]})
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
    ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
