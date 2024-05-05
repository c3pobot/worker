'use strict'
const mongo = require('mongoclient')
const { getGuildMemberName, checkBotPerms } = require('src/helpers')

module.exports = async(obj = {}, shard = {}, opt = {})=>{
  let chId = opt.channel?.value || shard.adminChannel, dId = opt.user?.value || shard.adminUser, option = opt.option.value
  if(option === 'channel'){
    if(!chId) return { content: 'You must provide a channel' }
    if(opt.channel?.botPerms){
      let channelPerm = checkBotPerms('SEND_MESSAGES', opt.channel?.botPerms)
      if(!channelPerm) return { content: `I do not have permissions to send messages to <#${chId}>...`}
    }
    await mongo.set('payoutServers', {_id: shard._id}, { adminMsg: option, adminChannel: chId })
    return { content: 'admin messages have been set up to post to <#'+chId+'>' }
  }
  if(option === 'dm'){
    if(!dId) return { content: 'you must provide a user' }
    let username = await getGuildMemberName(obj.guild_id, dId)
    await mongo.set('payoutServers', {_id: shard._id}, { adminMsg: option, adminUser: dId })
    return { content: 'admin messages have been set up to send to @'+usrname }
  }
  if(option == 'off'){
    await mongo.set('payoutServers', {_id: shard._id}, { adminMsg: option })
    return { content: 'admin messages have been turned off' }
  }
  return { content: 'You did not provide and settings to change' }
}
