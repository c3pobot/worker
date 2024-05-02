'use strict'
const mongo = require('mongoclient')
const shardLimit = +process.env.SHARD_LIMIT || 100

const { addShardCmds } = require('src/helpers')

module.exports = async(obj = {}, opt = {})=>{
  let type = opt.type?.value || 'ship', patreonId = opt.patreon?.value, sId = obj.channel?.guild_id, catId = obj.channel?.parent_id
  let shardId = `${sId}-${catId}`
  if(sId && !catId) return { content: "This channel is not part of a category" }
  if(!sId || !catId || !shardId) return { content: 'error figuring out shardId' }

  let shards = await mongo.find('payoutServers', {}, { type: 1, _id: 1, shard: 1 })
  if(!shards) return { content: 'error getting shards' }
  if(shards.filter(x=>x._id === shardId).length > 0) return { content: 'This channel/category combination is already registered as a poserver' }

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
  let msg2send = { content: 'Added server as **'+type+'**' }
  let status = await addShardCmds(sId)
  if(status) msg2send.content += '\nshard commands have been added.'
  return msg2send
}
