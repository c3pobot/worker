'use strict'
const mongo = require('mongoclient')

module.exports = async(obj = {}, shard = {}, opt = {})=>{
  let allyCode = opt.allycode?.value?.toString()?.replace(/-/g, '')
  if(!allyCode) return { content: 'you did not provide an allyCode' }
  if(!shard.watch || !shard.watch[allyCode]) return {content: 'There is not role watch for that player' }
  delete shard.watch[allyCode]
  await mongo.set('payoutServers', {_id: shard._id}, { watch: shard.watch })
  return { content: 'Role watch for **'+allyCode+'** was removed' }
}
