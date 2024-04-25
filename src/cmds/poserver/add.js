'use strict'
const mongo = require('mongoclient')
const { getOptValue, addShardCmds } = require('src/helpers')
const { GetChannel } = require('src/helpers/discordmsg')

module.exports = async(obj = {}, opt = [])=>{
  let channel, catId, sId = obj.guild_id, shardLimit = +process.env.SHARD_LIMIT || 100, shardCount = 99, shardId, msg2send = { content: "This channel is not part of a category" }
  let shards = await mongo.find('payoutServers', {}, { type: 1, _id: 1, shard: 1 })
  let type = getOptValue(opt, 'type', 'char')
  let patreonId = getOptValue(opt, 'patreon')
  if(obj.channel_id) channel = await GetChannel(obj.channel_id)
  if(channel?.parent_id > 999999) catId = channel.parent_id
  if(sId && catId) shardId = sId+'-'+catId
  if(shardId && shards.filter(x=>x._id === shardId).length > 0) msg2send.content = 'This channel/category combination is already registered as a **'+shards.filter(x=>x._id == shardId)[0].type+'** payout server'
  if(shardId && type && shards.filter(x=>x._id === shardId).length == 0){
    await mongo.set('payoutServers', {_id: shardId}, {
      shardId: shardId,
      sId: sId,
      catId: catId,
      allowAll: 1,
      patreonId: patreonId,
      poSort: 'descending',
      rankSort: 'ascending',
      sort: 'name',
      status: 1,
      message: 'default',
      shardLimit: +shardLimit,
      type: type,
      alt: type == 'char' ? 'ship' : 'char'
    })

    let status = await addShardCmds(sId)
    msg2send.content = 'Added server as **'+type+'**'
    if(status) msg2send.content += '\nshard commands have been added.'
  }
  return msg2send
}
