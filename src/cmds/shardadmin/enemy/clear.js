'use strict'
const mongo = require('mongoclient')
const { getOptValue } = require('src/helpers')

module.exports = async(obj = {}, shard = {}, opt = [])=>{
  let msg2send = {content: 'Nothing was changed'}
  let confirm = getOptValue(opt, 'confirm')

  if(shard.enemyWatch && confirm === 'yes'){
    await mongo.unset('payoutServers', {_id: shard._id}, {enemyWatch: shard.enemyWatch})
    msg2send.content = 'Enemy group watch has been cleared'
  }
  return msg2send
}
