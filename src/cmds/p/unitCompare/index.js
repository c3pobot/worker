'use strict'
const getImg = require('./getImg')

const { getDiscordAC, getPlayerAC, fetchPlayer, findUnit } = require('src/helpers')

module.exports = async(obj = {}, opt = {})=>{
  if(obj.confirm?.cancel) return { content: 'command canceled...', components: [] }

  let dObj = await getDiscordAC(obj.member.user.id, opt)
  if(!dObj?.allyCode) return { content: 'You do not have allyCode linked to discordId' }

  let edObj = await getPlayerAC({}, opt)
  if(edObj?.mentionError) return { content: 'That user does not have allyCode linked to discordId' }
  let eAllyCode = edObj?.allyCode?.toString()?.trim()?.replace(/-/g, '')
  if(!eAllyCode) return { content: 'You must provide @user or allyCode to compare with' }
  if(eAllyCode === dObj.allyCode) return { content: 'you can\'t compare to yourself'}

  let unit = getOptValue(opt, 'unit')?.toString()?.trim()
  if(!unit) return { content: 'you did not provide a unit for comparison'}

  let uInfo = await findUnit(obj, unit)
  if(uInfo.msg2send) return uInfo.msg2send
  if(!uInfo?.baseId) return { content: `Error finding **${unit}**` }

  let [ pObj, eObj ] = await Promise.all([
    fetchPlayer({ allyCode: dObj.allyCode?.toString(), projection: { playerId: 1, name: 1, updated: 1, rosterUnit: { $elemMatch: { baseId: uInfo.baseId } }} }),
    fetchPlayer({ allyCode: eAllyCode?.toString(), projection: { playerId: 1, name: 1, updated: 1, rosterUnit: { $elemMatch: { baseId: uInfo.baseId } }}})
  ])
  if(!pObj?.rosterUnit || !eObj?.rosterUnit) return { content: 'Error getting player data'}

  return await getImg(uInfo, pObj, eObj)
}
