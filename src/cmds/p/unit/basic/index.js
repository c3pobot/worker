'use strict'
const getImg = require('./getImg')
const { getOptValue, getPlayerAC, fetchPlayer, findUnit, replyButton } = require('src/helpers')

module.exports = async(obj = {}, opt = [])=>{
  let uInfo, allyCode, guildId, msg2send = {content: 'You do not have allycode linked to discordId'}, pObj
  let allyObj = await getPlayerAC(obj, opt)
  if(allyObj?.mentionError) return { content: 'that user does not have allyCode linked to discordId' }
  let allyCode = allyObj?.allyCode
  if(!allyCode) return msg2send
  let unit = getOptValue(opt, 'unit')
  if(allyCode && unit){
    unit = unit.toString().trim()
    msg2send.content = 'Error finding unit **'+unit+'**'
    uInfo = await findUnit(obj, unit, guildId)
    if(uInfo === 'GETTING_CONFIRMATION') return
  }
  if(uInfo){
    await replyButton(obj, 'Getting info for **'+uInfo.nameKey+'** ...')
    msg2send.content = 'Error getting player info'
    pObj = await fetchPlayer({allyCode: allyCode.toString()})
  }
  if(pObj?.allyCode) msg2send = await GetImg(uInfo, pObj)
  return msg2send
}
