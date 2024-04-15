'use strict'
const mongo = require('mongoclient')
const { getOptValue, confirmButton } = require('src/helpers')

module.exports = async(obj = {}, shard = {}, opt = [])=>{
  let msg2send = {content: 'Error with provided info'}, alias, confirmRemove
  let confirmRemove = obj.confirm?.response
  let alias = getOptValue(opt, 'alias')?.trim()
  if(!alias) return { content: 'you did not provide an alias'}
  msg2send.content = '**'+alias+'** is not a squad lead alias for this server'
  if(!confirmRemove){
    let unit = shard?.alias?.find(x=>x.alias?.toUpperCase() === alias?.toUpperCase())
    if(!unit) return msg2send
    await confirmButton(obj, 'Are your sure you want to remove **'+alias+'** as a squad lead alias for **'+unit.nameKey+'**?')
    return
  }
  msg2send.content = 'Command canceled'
  if(confirmRemove === 'yes'){
    await mongo.pull('payoutServers', {_id: shard._id}, {alias: {alias: alias}})
    msg2send.content = '**'+alias+'** was removed as a squad lead alias for this server'
  }
  return msg2send
}
