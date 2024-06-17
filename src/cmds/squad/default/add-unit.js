'use strict'
const mongo = require('mongoclient')
const { botSettings } = require('src/helpers/botSettings')
const { getDiscordAC, findUnit, getRelicLevel } = require('src/helpers')
const showUnits = require('./show-units')

module.exports = async(obj = {}, opt = {})=>{
  if(obj.confirm?.cancel) return { content: 'command canceled...', components: [] }

  let allyObj = await getDiscordAC(obj.member?.user?.id, opt)
  if(!allyObj?.allyCode) return { content: 'You do not have allycode linked to discordId' }

  let allyCode = allyObj.allyCode

  let unit = opt.unit?.value?.toString()?.trim()
  if(!unit) return { content: 'you did not provide a unit to search' }

  let uInfo = await findUnit(obj, unit)
  if(uInfo === 'GETTING_CONFIRMATION') return
  if(uInfo?.msg2send) return uInfo.msg2send
  if(!uInfo?.baseId) return { content: `Error finding **${unit}**` }

  if(uInfo.combatType === 2) return { content: `you cannot add ships to the list as they do not have gear or relic levels`}

  let pObj = (await mongo.find('defaultUnits', { _id: allyCode.toString() }, { _id: 0, TTL: 0 }))[0]
  if(!pObj) pObj = { allyCode: +allyCode, units: [], nameKey: 'default units' }
  if(!pObj?.units) return { content: 'error getting data' }

  if(pObj.units?.length >= 15) return { content: 'you can only add 15 units to the list' }

  if(pObj.units?.filter(x=>x.baseId === uInfo.baseId).length > 0) return { content: `${uInfo.nameKey} is already in default unit list for allyCode ${allyCode}` }
  let { gLevel, rLevel } = getRelicLevel(opt, 7, 13)
  let tempUnit = { baseId: uInfo.baseId, nameKey: uInfo.nameKey, combatType: uInfo.combatType, rarity: 7 }
  if(rLevel > 0){
    tempUnit.gear = { nameKey: `R${rLevel}`, name: 'relic', value: rLevel + 2 }
  }else {
    tempUnit.gear = { nameKey: `G${gLevel}`, name: 'gear', value: gLevel }
  }
  pObj.units.push(tempUnit)
  await mongo.set('defaultUnits', { _id: allyCode?.toString() }, pObj)

  return await showUnits(obj, opt)
}
