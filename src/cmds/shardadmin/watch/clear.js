'use strict'
const mongo = require('mongoclient')
const { getOptValue } = require('src/helpers')

module.exports = async(obj = {}, shard = {}, opt = [])=>{
  let msg2send = {content: 'Nothing was changed'}
  let confirm = getOptValue(opt, 'confirm')
  if(shard.watch && confirm === 'yes'){
    await mongo.unset('payoutServers', {_id: shard._id}, {watch: shard.watch})
    msg2send.content = 'All Role watches have been cleared'
  }
  return msg2send
}
