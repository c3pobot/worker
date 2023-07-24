'use strict'
const { configMaps } = require('helpers/configMaps')
const { FindUnit, GetAllyCodeFromDiscordId, GetAllyCodeObj, ReplyMsg } = require('helpers')
const swgohClient = require('swgohClient')
const getImg = require('./getImg')
module.exports = async(obj = {}, opt = [])=>{
  try{
    let allyCode, baseId, enemyCode, pObj, eObj, msg2send = {content: 'error finding the requested unit'}
    if(obj.confirm) baseId = obj.confirm.baseId
    if(!baseId) baseId = await FindUnit(obj, opt, 'unit')
    if(baseId) await HP.ReplyButton(obj, 'Getting info for **'+configMaps.UnitMap[baseId].nameKey+'** ...')
    if(!baseId){
      await ReplyMsg(obj, msg2send)
      return
    }
    msg2send.content = 'You do not have allyCode linked to discordId'
    let dObj = await GetAllyCodeFromDiscordId(obj.member.user.id, opt)
    if(dObj?.allyCode){
      msg2send.content = 'You must provide @user or allyCode to compare with'
      edObj = await GetAllyCodeObj({}, opt)
      if(edObj?.mentionError) msg2send.content = 'That user does not have allyCode linked to discordId'
      enemyCode = edObj.allyCode
    }
    if(allyCode && enemyCode){
      msg2send.content = 'error getting player info'
      pObj = await swgohClient('fetchPlayer', { allyCode: allyCode.toString(), project: { roster: { [baseId]: 1 }, updated: 1, name: 1 }})
      if(pObj?.name && pObj?.roster[baseId]){
        msg2send.content = 'error getting opponent info'
        eObj = await swgohClient('fetchPlayer', { allyCode: enemyCode.toString(), project: { roster: { [baseId]: 1 }, updated: 1, name: 1 }})
        if(eObj?.name && !eObj?.roster[baseId]) msg2send.content = 'opponent does not have **'+configMaps.UnitMap[baseId].nameKey+'** activated'
      }else{
        if(pObj?.name) msg2send.content = 'You do not have **'+configMaps.UnitMap[baseId].nameKey+'** activated'
      }
    }
    if(pObj?.roster[baseId] && eObj?.roster[baseId]) msg2send = await getImg(obj, pObj, eObj, baseId)
    await ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
