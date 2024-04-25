'use strict'
const mongo = require('mongoclient')
const { getOptValue, createIntialMessage } = require('src/helpers')
const { GetChannel } = require('src/helpers/discordmsg')

module.exports = async(obj = {}, shard = {}, opt = [])=>{
  let msg2send = {content: ""}, payload, payChannel, rankChannel, logChannel, altChannel
  let poChId = getOptValue(opt, 'payouts')
  let ranksChId = getOptValue(opt, 'ranks')
  let logChId = getOptValue(opt, 'logs')
  let altChId = getOptValue(opt, 'alt-log')
  if(poChId) payChannel = await GetChannel(poChId)
  if(ranksChId) rankChannel = await GetChannel(ranksChId)
  if(logChId) logChannel = await GetChannel(logChId)
  if(altChId) altChannel = await GetChannel(altChId)
  if(payChannel && payChannel?.parent_id !== shard.catId) msg2send.content += '<#'+payChannel.id+'> is not in the same category as the shard'
  if(payChannel?.parent_id === shard.catId){
    let payStatus = await createIntialMessage({chId: payChannel.id, sId: shard.sId})
    if(payStatus?.id){
      if(!payload) payload = {}
      payload.payChannel = payChannel.id
      payload.payMsgs = [payStatus.id]
      msg2send.content += '<#'+payChannel.id+'> was set as payouts channel\n'
    }else{
      msg2send.content += 'Error setting <#'+payChannel.id+'> as payouts channel\n'
    }
  }
  if(rankChannel && rankChannel.parent_id !== shard.catId) msg2send.content += '<#'+rankChannel.id+'> is not in the same category as the shard'
  if(rankChannel?.parent_id === shard.catId){
    let rankStatus = await createIntialMessage({chId: rankChannel.id, sId: shard.sId})
    if(rankStatus?.id){
      if(!payload) payload = {}
      payload.rankChannel = rankChannel.id
      payload.rankMsgs = [rankStatus.id]
      msg2send.content += '<#'+rankChannel.id+'> was set as rank channel\n'
    }else{
      msg2send.content += 'Error setting <#'+rankChannel.id+'> as rank channel\n'
    }
  }
  if(logChannel && logChannel.parent_id !== shard.catId) msg2send.content += '<#'+logChannel.id+'> is not in the same category as the shard'
  if(logChannel?.parent_id === shard.catId){
    if(!payload) payload = {}
    payload.logChannel = logChannel.id
    msg2send.content += '<#'+logChannel.id+'> was set as log channel\n'
  }
  if(altChannel && altChannel.parent_id !== shard.catId) msg2send.content += '<#'+altChannel.id+'> is not in the same category as the shard'
  if(altChannel?.parent_id === shard.catId){
    if(!payload) payload = {}
    payload.altChannel = altChannel.id
    msg2send.content += '<#'+altChannel.id+'> was set as alt log channel\n'
  }
  if(payload) await mongo.set('payoutServers', {_id: shard._id}, payload)
  if(msg2send.content === "") msg2send.content = 'You did not provide any channels to update'
  return msg2send
}
