'use strict'
const getImg = require('./getImg')
const { getDiscordAC, getPlayerAC, getOptValue, replyButton, fetchPlayer, findUnit } = require('src/helpers')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'You do not have allyCode linked to discordId'}
  let dObj = await getDiscordAC(obj.member.user.id, opt)
  if(!dObj?.allyCode) return msg2send

  let edObj = await getPlayerAC({}, opt)
  if(edObj?.mentionError) return { content: 'That user does not have allyCode linked to discordId' }
  let eAllyCode = edObj?.allyCode?.toString()?.trim()?.replace(/-/g, '')
  if(!eAllyCode) return { content: 'You must provide @user or allyCode to compare with' }
  if(eAllyCode === dObj.allyCode) return { content: 'you can\'t compare to yourself'}

  let unit = getOptValue(opt, 'unit')?.toString()?.trim()
  if(!unit) return { content: 'you did not provide a unit for comparison'}

  let uInfo = await findUnit(obj, unit)
  if(uInfo === 'GETTING_CONFIRMATION') return
  if(!uInfo?.baseId) return { content: `Error finding unit **${unit}**`}

  let [ pObj, eObj ] = await Promise.all([
    fetchPlayer({ allyCode: dObj.allyCode?.toString(), projection: { playerId: 1, name: 1, updated: 1, rosterUnit: { $elemMatch: { baseId: uInfo.baseId } }} }),
    fetchPlayer({ allyCode: eAllyCode?.toString(), projection: { playerId: 1, name: 1, updated: 1, rosterUnit: { $elemMatch: { baseId: uInfo.baseId } }}})
  ])
  if(!pObj?.rosterUnit || !eObj?.rosterUnit) return { content: 'Error getting player data'}

  msg2send = await getImg(uInfo, pObj, eObj)
  return msg2send
}
