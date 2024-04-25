'use strict'
const getImg = require('./getImg')
const { getOptValue, getPlayerAC, fetchPlayer, findUnit, replyButton } = require('src/helpers')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = { content: 'You do not have allycode linked to discordId' }
  if(obj.confirm) await replyButton(obj)
  let allyObj = await getPlayerAC(obj, opt)
  if(allyObj?.mentionError) return { content: 'that user does not have allyCode linked to discordId' }
  let allyCode = allyObj?.allyCode
  if(!allyCode) return msg2send

  let unit = getOptValue(opt, 'unit')?.toString()?.trim()
  if(!unit) return { content: 'you did not find a unit to search'}

  let uInfo = await findUnit(obj, unit)
  if(uInfo === 'GETTING_CONFIRMATION') return
  if(!uInfo?.baseId) return { content: `Error finding **${unit}**`}

  let pObj = await fetchPlayer({ allyCode: allyCode?.toString(), projection: { playerId: 1, name: 1, updated: 1, rosterUnit: { $elemMatch: { baseId: uInfo.baseId } }} })
  if(!pObj?.rosterUnit) return { content: `Error getting player data for **${allyCode}**`}

  msg2send = await getImg(uInfo, pObj)
  return msg2send
}
