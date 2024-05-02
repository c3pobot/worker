'use strict'
const mongo = require('mongoclient')
module.exports = async(obj = {})=>{
  if(!obj.channel) return
  let catId = obj.channel.parent_id, sId = obj.guild_id

  let shard = (await mongo.find('payoutServers', {_id: `${sId}-${catId}` }))[0]
  if(shard) return shard

  let shards = await mongo.find('payoutServers', { sId: sId })
  if(shards?.length == 1) return shards[0]
}
