'use strict'
const mongo = require('mongoclient')
const { removeShardCmds } = require('src/helpers')

module.exports = async(obj = {}, opt = {})=>{
  if(obj.confirm?.response !== 'yes') return { content: 'command canceled' }

  let shardId = opt.shardid?.value || `${obj.guild_id}-${obj.channel?.parent_id}`
  let shard = (await mongo.find('payoutServers', {_id: shardId}))[0]
  if(shardId && !shard) return { content: `There is no payout shard with for ${shardId}` }

  if(obj.confirm?.response == 'yes'){
    await mongo.del('payoutServers', {_id: shardId})
    await mongo.delMany('shardPlayers', {shardId: shardId})
    await mongo.delMany('shardRankCache', {shardId: shardId})
    await mongo.delMany('shardPlayers', {shardId: shardId})
    await mongo.delMany('shardRankCache', {shardId: shardId})
    let cmdStatus = await removeShardCmds(shard.sId)
    let msg2send = { content: 'Payout Server with shardId **'+shardId+'** was removed.' }
    if(cmdStatus) msg2send.content += `\nRemoved ${cmdStatus?.success}/${cmdStatus?.count} shard commands.`
    return msg2send
  }
  let actionRow = { type: 1, components: [] }
  actionRow.push({
    type: 2,
    label: 'Yes',
    style: 3,
    custom_id: JSON.stringify({ id: obj.id, dId: obj.message?.user?.id, response: 'yes' })
  })
  actionRow.push({
    type: 2,
    label: 'no',
    style: 4,
    custom_id: JSON.stringify({ id: obj.id, dId: obj.message?.user?.id, response: 'no' })
  })
  return { content: 'Are you sure you want to delete po shard with shardId of **'+shardId+'** ?', components: actionRow }
}
