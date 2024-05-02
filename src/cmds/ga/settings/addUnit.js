'use strict'
const mongo = require('mongoclient')
const showSettings = require('./show')
const { getDiscordAC, findUnit } = require('src/helpers')

module.exports = async(obj = {}, opt = {})=>{
  if(obj.confirm?.cancel) return { content: 'command canceled...', components: [] }

  let dObj = await getDiscordAC(obj.member.user.id, opt)
  let allyCode = dObj?.allyCode
  if(!allyCode) return { content: 'Your allyCode is not linked to your discord id' }

  let unit = opt.unit?.value?.toString()?.trim()
  if(!unit) return { content: 'you did not specify a unit' }

  let uInfo = await findUnit(obj, unit)
  if(uInfo?.msg2send) return uInfo.msg2send
  if(!uInfo?.baseId) return { content: `Error finding **${unit}**`}

  let gaInfo = (await mongo.find('ga', {_id: allyCode.toString()}))[0]
  if(!gaInfo) gaInfo = { units: [], enemies: [] }
  if(!gaInfo.units) gaInfo.units = [];
  if(!gaInfo.enemies) gaInfo.enemies = [];
  if(!gaInfo.playerId && pObj.id) gaInfo.playerId = pObj.id
  if(gaInfo.units.filter(x=>x.baseId == uInfo.baseId).length > 0) return { content: `${uInfo.nameKey} is already in your ga unit list` }

  gaInfo.units.push({
    baseId: uInfo.baseId,
    nameKey: uInfo.nameKey,
    combatType: uInfo.combatType
  })
  await mongo.set('ga', { _id: dObj.allyCode.toString() }, gaInfo)
  return await showSettings(obj, opt, dObj, gaInfo)
}
