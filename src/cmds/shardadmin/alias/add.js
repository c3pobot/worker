'use strict'
const mongo = require('mongoclient')
const { getOptValue, findUnit, replyButton } = require('src/helpers')

module.exports = async(obj = {}, shard = [], opt = [])=>{
  let msg2send = {content: 'Error with provided info'}, unit, uInfo
  let alias = getOptValue(opt, 'alias')?.value.trim()
  if(!alias) return msg2send
  msg2send.content = 'There is already an alias **'+alias+'** for this server'
  if(shard.alias?.filter(x=>x.alias?.toUpperCase() == alias?.toUpperCase()).length === 0 || !shard.alias){
    msg2send.content = 'You did not provide a unit to search'
    unit = getOptValue(opt, 'unit')
  }
  if(unit){
    unit = unit.toString().trim()
    msg2send.content = 'Error find unit **'+unit+'**'
    uInfo = await findUnit(obj, unit, null)
    if(uInfo === 'GETTING_CONFIRMATION') return
  }
  if(uInfo?.nameKey){
    await replyButton(obj, 'Setting aliad for **'+uInfo.nameKey+'** ...')
    msg2send.content = '**'+alias+'** was added as an alias for **'+uInfo.nameKey+'**'
    if(shard.alias?.filter(x=>x.alias?.toUpperCase() === alias.toUpperCase()).length == 0 || !shard.alias){
      await mongo.push('payoutServers', {_id: shard._id}, {alias: {baseId: uInfo.baseId, alias: alias, nameKey: uInfo.nameKey}})
    }
  }
  return msg2send
}
