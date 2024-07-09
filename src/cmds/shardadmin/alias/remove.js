'use strict'
const mongo = require('mongoclient')
const { getOptValue, confirmButton } = require('src/helpers')

module.exports = async(obj = {}, shard = {}, opt = {})=>{
  if(obj.confirm?.response == 'no') return { content: 'command canceled...', components: [] }

  let alias = opt.value?.alias?.toString()?.trim()
  if(!alias) return { content: 'you did not provide an alias' }

  if(!shard.alias || shard.alias.filter(x=>x.alias?.toUpperCase() === alias?.toUpperCase()).length == 0) return { content: `${alias} is not an alias for any units.` }

  if(!obj.confirm?.response){
    await confirmButton(obj, 'Are your sure you want to remove **'+alias+'** as a squad lead alias for **'+unit.nameKey+'**?')
    return
  }
  if(obj.confirm?.response == 'yes'){
    await mongo.set('payoutServers', { _id: shard._id }, { alias: shard.alias.filter(x=>x.alias?.toUpperCase() !== alias?.toUpperCase()) })
    return { content: '**'+alias+'** was removed as a squad lead alias for this server' }
  }
  return { content: 'command canceled...', components: [] }
}
