'use strict'
const { botSettings } = require('src/helpers/botSettings')
const getImg = require('./getImg')
const { getOptValue, getPlayerAC, findUnit, replyButton, fetchPlayer } = require('src/helpers')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'You do not have allycode linked to discordId'}, gLevel = 13, rLevel = botSettings.maxRelic || 10
  if(obj.confirm) await replyButton(obj)

  let allyObj = await getPlayerAC(obj, opt)
  if(allyObj?.mentionError) return { content: 'that user does not have allyCode linked to discordId' }
  let allyCode = allyObj?.allyCode
  if(!allyCode) return msg2send

  let unit = getOptValue(opt, 'unit')?.toString()?.trim()
  if(!unit) return { content: 'you did not provide a unit' }

  let uInfo = await findUnit(obj, unit)
  if(uInfo === 'GETTING_CONFIRMATION') return
  if(!uInfo?.baseId) return { content: `Error finding **${unit}**` }

  let pObj = await fetchPlayer({ allyCode: allyCode?.toString(), projection: { playerId: 1, name: 1, updated: 1, rosterUnit: { $elemMatch: { baseId: uInfo.baseId } }} })
  if(!pObj?.rosterUnit) return { content: `Error getting data for **${allyCode}**` }

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
  msg2send = await getImg(uInfo, pObj, gLevel, rLevel, rarity);
  return msg2send
}
