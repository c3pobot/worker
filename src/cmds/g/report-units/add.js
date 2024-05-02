'use strict'
const mongo = require('mongoclient')
const { findUnit } = require('src/helpers')

module.exports = async(obj = {}, opt = {}, pObj = {})=>{
  if(obj.confirm?.cancel) return { content: 'command canceled...' }

  if(!pObj.guildId) return { content: 'You allyCode is not linked to your discordId or you are not part of a guild...' }

  let unit = opt.unit?.value?.toString()?.trim()
  if(!unit) return { content: 'you must provide a unit...' }

  let uInfo = await findUnit(obj, unit)
  if(uInfo?.msg2send) return uInfo.msg2send
  if(!uInfo?.baseId) return { content: `error finding ${unit}` }

  let gObj = (await mongo.find('guilds', { _id: pObj.guildId }))[0]
  if(!gObj){
    gObj = { guildName: pObj.guildName, sync: 0 }
    await mongo.set('guilds', {_id: guildId}, gObj)
  }
  if(!gObj.units) gObj.units = []
  if(gObj?.units?.filter(x=>x?.baseId == uInfo.baseId)?.length > 0) return { content: `${uInfo.nameKey} is already in the list` }

  gObj.units.push({ baseId: uInfo.baseId, nameKey: uInfo.nameKey, combatType: uInfo.combatType })
  await mongo.set('guilds', { _id: pObj.guildId }, { units: gObj.units })
  return { content: `${uInfo.nameKey} was added to list for guild report...` }
}
