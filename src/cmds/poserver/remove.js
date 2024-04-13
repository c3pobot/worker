'use strict'
module.exports = async(obj, opt = [])=>{
  try{
    let msg2send = {content: 'shard id is not valid'}, sId, shard, userConfirm
    if(obj.confirm && obj.confirm.response) userConfirm = obj.confirm.response
    let shardId = await HP.GetOptValue(opt, 'shardid')
    if(!shardId){
      const channel = await MSG.GetChannel(obj.channel_id)
      if(channel?.parent_id && obj?.guild_id) shardId = obj.guild_id+'-'+channel.parent_id
    }
    if(shardId) shard = (await mongo.find('payoutServers', {_id: shardId}))[0]
    if(shardId && !shard) msg2send.content = 'There is no payout shard with that shardId'
    if(shard && !userConfirm){
      await HP.ConfirmButton(obj, 'Are you sure you want to delete po shard with shardId of **'+shardId+'** ?')
      return;
    }
    if(userConfirm == 'no') msg2send.content = 'Command Canceled'
    if(shard?.sId && userConfirm == 'yes'){
      await mongo.del('payoutServers', {_id: shardId})
      await mongo.delMany('shardPlayers', {shardId: shardId})
      await mongo.delMany('shardRankCache', {shardId: shardId})
      await mongo.delMany('shardPlayers', {shardId: shardId})
      await mongo.delMany('shardRankCache', {shardId: shardId})
      const cmdStatus = await HP.RemoveShardCmds(shard.sId)
      msg2send.content = 'Payout Server with shardId **'+shardId+'** was removed.'
    }
    await HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e)
    HP.ReplyMsg(obj, {content: 'An error occured'})
  }
}
