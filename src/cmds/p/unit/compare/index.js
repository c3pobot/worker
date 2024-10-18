'use strict'
const getImg = require('./getImg')

const { botSettings } = require('src/helpers/botSettings')

const { getPlayerAC, findUnit, fetchPlayer, getRelicLevel } = require('src/helpers')

module.exports = async(obj = {}, opt = {})=>{
  if(obj.confirm?.cancel) return { content: 'command canceled...', components: [] }

  let allyObj = await getPlayerAC(obj, opt)
  let allyCode = allyObj?.allyCode
  if(allyObj?.mentionError) return { content: 'that user does not have allyCode linked to discordId' }
  if(!allyCode) return { content: 'You do not have allycode linked to discordId' }

  let unit = opt.unit?.value?.toString()?.trim()
  if(!unit) return { content: 'you did not provide a unit to search' }

  let uInfo = await findUnit(obj, unit)
  if(uInfo === 'GETTING_CONFIRMATION') return
  if(uInfo?.msg2send) return uInfo.msg2send
  if(!uInfo?.baseId) return { content: `Error finding **${unit}**` }
  let projection = { playerId: 1, name: 1, updated: 1, rosterUnit: { $elemMatch: { baseId: uInfo.baseId } }}
  if(uInfo.combatType === 2) projection.rosterUnit = 1
  let pObj = await fetchPlayer({ allyCode: allyCode?.toString(), projection: projection })
  if(!pObj?.rosterUnit) return { content: `Error getting player data for **${allyCode}**` }

  let rarity = opt.rarity?.value
  if(rarity){
    if(rarity > 7 || 0 >= rarity) rarity = 7
    rarity = +rarity
  }
  let { rLevel, gLevel } = getRelicLevel(opt)
  if(rLevel) rLevel += 2
  return await getImg(uInfo, pObj, gLevel, rLevel, rarity)
}
