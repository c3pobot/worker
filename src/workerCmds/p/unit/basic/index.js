'use strict'
const { configMaps } = require('helpers/configMaps')
const { mongo, GetAllyCodeObj, FindUnit, GetOptValue, ReplyButton, ReplyMsg } = require('helpers')
const swgohClient = require('swgohClient')
const getImg = require('./getImg')
module.exports = async(obj = {}, opt = [])=>{
  try{
    let baseId, dObj, allyCode, pObj, msg2send = {content: 'error finding the requested unit'}
    if(obj.confirm) baseId = obj.confirm.baseId
    if(!baseId) baseId = await FindUnit(obj, opt, 'unit')
    if(baseId === 'GETTING_CONFIRMATION') return
    if(baseId){
      await ReplyButton(obj, 'Getting info for **'+configMaps.UnitMap[baseId].nameKey+'** ...')
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
    if(pObj?.name) msg2send = await getImg(obj, pObj, baseId)
    ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
