'use strict'
const mongo = require('mongoclient')
const { getOptValue } = require('src/helpers')

module.exports = async(obj = {}, shard = {}, opt = [])=>{
  let msg2send = {content: 'There is not role watch for that player'}
  let allyCode = getOptValue(opt, 'allycode')?.toString()?.replace(/-/g, '')
  if(allyCode && shard.watch && shard.watch[allyCode]){
    await mongo.unset('payoutServers', {_id: shard._id}, {['watch.'+allyCode]:shard.watch[allyCode]})
    msg2send.content = 'Role watch for **'+allyCode+'** was removed'
  }
  return msg2send
}
