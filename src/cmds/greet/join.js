'use strict'
const mongo = require('mongoclient')

const { checkBotPerms } = require('src/helpers')

module.exports = async(obj = {}, opt = {})=>{
  let server = (await mongo.find('discordServer', {_id: obj.guild_id}))[0]
  let channel = opt.channel?.data, status = opt.status?.value
  if(channel){
    let channelPerm = checkBotPerms('SEND_MESSAGES', opt.channel?.botPerms)
    if(!channelPerm) return { content: `I do not have permissions to send messages to <#${channel.id}>...`}
  }
  let chId = channel?.id || server?.newMember
  if(!chId) return { content: 'you must specify a channel for joing messages...'}

  if(status == 'disable'){
    await mongo.set('discordServer', {_id: obj.guild_id}, { newMember: null })
    return { content: 'You have disabled new member join messages' }
  }

  await mongo.set('discordServer', {_id: obj.guild_id}, { newMember: channel.id })
  return { content: `<#${chId}> has been set to receive user joing messages.` }
}
