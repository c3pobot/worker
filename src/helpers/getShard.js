'use strict'
const { GetChannel } = require('./discordmsg')
module.exports = async(obj)=>{
  let catId, channel, shard
  if(obj && obj.channel_id) channel = await GetChannel(obj.channel_id)
  if(channel && channel.parent_id) catId = channel.parent_id
  if(catId) shard = (await mongo.find('payoutServers', {_id: obj.guild_id+'-'+catId}))[0]
  if(!shard){
    let shards = await mongo.find('payoutServers', {sId: obj.guild_id})
    if(shards && shards.length == 1) shard = shards[0]
  }
  return shard;
}
