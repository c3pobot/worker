'use strict'
const mongo = require('mongoclient')

module.exports = async(obj = {}, shard = {}, opt = {})=>{
  if(opt.confirm?.value === 'yes'){
    await mongo.unset('payoutServers', {_id: shard._id}, {watch: shard.watch})
    return { content: 'All Role watches have been cleared' }
  }
  return { content: 'nothing was changed' }
}
