'use strict'
const mongo = require('mongoclient')
const { findUnit } = require('src/helpers')

module.exports = async(obj = {}, shard = {}, opt = {})=>{
  if(obj.confirm?.cancel) return { content: 'command canceled...', components: [] }

  let alias = opt.alias?.value?.toString().trim()
  if(!alias) return { content: 'you did not provide an alias' }
  if(shard.alias?.filter(x=>x.alias?.toUpperCase() === alias?.toUpperCase()).length > 0) return { content: 'There is already an alias **'+alias+'** for this server' }

  let unit = opt.unit?.value?.toString()?.trim()
  if(!unit) return { content: 'you did not provide a unit' }

  uInfo = await findUnit(obj, unit, null)
  if(uInfo === 'GETTING_CONFIRMATION') return
  if(uInfo?.msg2send) return uInfo.msg2send
  if(!uInfo?.baseId) return { content: `Error finding ${unit}`}

  if(!shard.alias) shard.alias = []
  shard.alias.push({ baseId: uInfo.baseId, alias: alias, nameKey: uInfo.nameKey })
  await mongo.set('payoutServers', { _id: shard._id }, { alias: shard.alias })
  return { content: '**'+alias+'** was added as an alias for **'+uInfo.nameKey+'**' }
}
