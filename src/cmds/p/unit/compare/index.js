'use strict'
const getImg = require('./getImg')
const { getOptValue, getPlayerAC, findUnit, replyButton, fetchPlayer } = require('src/helpers')

module.exports = async(obj = {}, opt = [])=>{
  let uInfo, msg2send = {content: 'You do not have allycode linked to discordId'}, gLevel = 13, rLevel = botSettings.maxRelic || 10, pObj
  let allyObj = await getPlayerAC(obj, opt)
  if(allyObj?.mentionError) return { content: 'that user does not have allyCode linked to discordId' }
  let allyCode = allyObj?.allyCode
  if(!allyCode) return msg2send
  let unit = getOptValue(opt, 'unit')
  let rarity = getOptValue(opt, 'rarity')
  if(rarity){
    if(rarity > 7 || 0 >= rarity) rarity = 7
    rarity = +rarity
  }
  let gType = getOptValue(opt, 'gear')
  let gValue = getOptValue(opt, 'value')
  if(gType && gValue){
    if(gType === 'g'){
      rLevel = 0, gLevel = +gValue
    }
    if(gType === 'r'){
      rLevel = gValue +2, rarity = 7
    }
  }
  if(unit){
    unit = unit.toString().trim()
    msg2send.content = 'Error finding unit **'+unit+'**'
    uInfo = await findUnit(obj, unit)
    if(uInfo === 'GETTING_CONFIRMATION') return
  }
  if(uInfo){
    await replyButton(obj, 'Getting info for **'+uInfo.nameKey+'** ...')
    msg2send.content = 'Error getting player info'
    pObj = await fetchPlayer({allyCode: allyCode.toString()})
  }
  if(pObj?.allyCode) msg2send = await getImg(uInfo, pObj, gLevel, rLevel, rarity);
  return msg2send
}
