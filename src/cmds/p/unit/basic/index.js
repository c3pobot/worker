'use strict'
const getImg = require('./getImg')

const { getPlayerAC, fetchPlayer, findUnit } = require('src/helpers')

module.exports = async(obj = {}, opt = {})=>{
  if(obj.confirm?.cancel) return { content: 'command canceled...', components: [] }

  let allyObj = await getPlayerAC(obj, opt)
  let allyCode = allyObj?.allyCode
  if(allyObj?.mentionError) return { content: 'that user does not have allyCode linked to discordId' }
  if(!allyCode) return { content: 'You do not have allycode linked to discordId' }

  let unit = opt.unit?.value?.toString()?.trim()
  if(!unit) return { content: 'you did not provide a unit to search' }

  let uInfo = await findUnit(obj, unit)
  if(uInfo.msg2send) return uInfo.msg2send
  if(!uInfo?.baseId) return { content: `Error finding **${unit}**` }

  let pObj = await fetchPlayer({ allyCode: allyCode?.toString(), projection: { playerId: 1, name: 1, updated: 1, rosterUnit: { $elemMatch: { baseId: uInfo.baseId } }} })
  if(!pObj?.rosterUnit) return { content: `Error getting player data for **${allyCode}**` }

  return await getImg(uInfo, pObj)
}
