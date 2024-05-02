'use strict'
const mongo = require('mongoclient')
const { checkBotPerms } = require('src/helpers')

module.exports = async(obj = {}, patreon = {}, opt = {})=>{
  let channel = opt.channel?.data
  if(channel){
    let channelPerm = checkBotPerms('SEND_MESSAGES', opt.channel?.botPerms)
    if(!channelPerm) return { content: `I do not have permissions to send messages to <#${channel.id}>...`}
  }

  if(channel){
    await mongo.set('patreon', { _id: patreon._id }, { logChannel: channel.id, sId: obj.guild_id })
    return { content: '<#'+channel.id+'> was set as log channel for you users to use' }
  }
  await mongo.set('patreon', { _id: patreon._id }, { logChannel: null, sId: null })
  return { content: 'You have removed the log channel for your users' }
}
