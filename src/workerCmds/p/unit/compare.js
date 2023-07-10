'use strict'
const { configMaps } = require('helpers/configMaps')
const { botSettings } = require('helpers/botSettings')
const { mongo, FindUnit, GetAllyCodeObj, GetOptValue, GetScreenShot, ModifyUnit, ReplyButton, ReplyMsg } = require('helpers')
const swgohClient = require('swgohClient')
const getHTML = require('helpers/getHTML/unitStats')
module.exports = async(obj = {}, opt = [])=>{
  try{
    let allyCode, baseId, dObj, pObj, webHTML, webImg, msg2send = {content: 'error finding the requested unit'}
    let gLevel = 13, rLevel = botSettings?.map?.maxRelic || 11
    if(obj.confirm) baseId = obj.confirm.baseId
    if(!baseId) baseId = await FindUnit(obj, opt, 'unit')
    let rarity = GetOptValue(opt, 'rarity', 7)
    let gType = GetOptValue(opt, 'gear')
    let gValue = GetOptValue(opt, 'value')
    if(rarity) rarity = +rarity
    if(rarity > 7 || 0 >= rarity) rarity = 7
    if(gType === 'g'){
      rLevel = 0
      if(gValue >= 0 && gValue < 13) gLevel = +gValue
    }
    if(gType === 'r'){
      if(gValue >= 0 && (+gValue + 2 < rLevel)){
        rLevel = +gValue + 2
        rarity = 7
      }
    }
    if(baseId){
      await ReplyButton(obj, 'Getting info for **'+configMaps.UnitMap[baseId].nameKey+'** ...')
      msg2send.content = 'You do not have an allycode linked to your discordId'
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
      msg2send.content = 'Error getting modifiedUnit'
      let modifiedUnit = await ModifyUnit(baseId, pObj.rosterUnit, gLevel, rLevel, rarity, true)
      if(modifiedUnit){
        msg2send.content = 'Error getting html'
        webHTML = await getHTML({player: pObj.name, updated: pObj.updated, unit: pObj?.roster[baseId], unit2: modifiedUnit})
        mongo.set('webTemp', {_id: 'unitgear'}, {data: {player: pObj.name, updated: pObj.updated, unit: pObj?.roster[baseId], unit2: modifiedUnit}})
      }
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
