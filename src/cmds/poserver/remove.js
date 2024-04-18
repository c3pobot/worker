'use strict'
const mongo = require('mongoclient')
const { getOptValue, confirmButton, removeShardCmds } = require('src/helpers')
const { GetChannel } = require('src/helpers/discordmsg')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'shard id is not valid'}, sId, shard, userConfirm
  if(obj.confirm?.response) userConfirm = obj.confirm.response
  let shardId = getOptValue(opt, 'shardid')
  if(!shardId){
    let channel = await GetChannel(obj.channel_id)
    if(channel?.parent_id && obj?.guild_id) shardId = obj.guild_id+'-'+channel.parent_id
  }
  if(shardId) shard = (await mongo.find('payoutServers', {_id: shardId}))[0]
  if(shardId && !shard) return { content: 'There is no payout shard with that shardId' }
  if(!userConfirm){
    await confirmButton(obj, 'Are you sure you want to delete po shard with shardId of **'+shardId+'** ?')
    return;
  }
  if(userConfirm === 'no') return { content: 'Command Canceled' }
  if(shard?.sId && userConfirm == 'yes'){
    await mongo.del('payoutServers', {_id: shardId})
    await mongo.delMany('shardPlayers', {shardId: shardId})
    await mongo.delMany('shardRankCache', {shardId: shardId})
    await mongo.delMany('shardPlayers', {shardId: shardId})
    await mongo.delMany('shardRankCache', {shardId: shardId})
    let cmdStatus = await removeShardCmds(shard.sId)
    msg2send.content = 'Payout Server with shardId **'+shardId+'** was removed.'
  }
  return msg2send
}
