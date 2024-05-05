'use strict'
const mongo = require('mongoclient')

module.exports = async(obj = {}, shard = {}, opt = {})=>{
  if(shard.enemyWatch && confirm === 'yes'){
    await mongo.set('payoutServers', {_id: shard._id}, { enemyWatch: null })
    msg2send.content = 'Enemy group watch has been cleared'
  }
  return { content: 'Nothing was changed' }
}
