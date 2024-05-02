'use strict'
const mongo = require('mongoclient')

const { checkBotPerms } = require('src/helpers')

module.exports = async(obj = {}, opt = {})=>{
  let tempObj = { status: 1 }
  let server = (await mongo.find('discordServer', { _id: obj.guild_id }))[0]
  if(server?.welcome) tempObj = server.welcome
  let channel = opt.channel?.data, msg = opt.message?.value?.toString()?.trim(), status = opt.status?.value
  if(channel){
    let channelPerm = checkBotPerms('SEND_MESSAGES', opt.channel?.botPerms)
    if(!channelPerm) return { content: `I do not have permissions to send messages to <#${channel.id}>...`}
    tempObj.chId = channel.id
  }
  if(msg) tempObj.msg = msg
  if(status) tempObj.status = (status == 'enable' ? 1:0)
  if(!tempObj.chId || !tempObj.msg) return { content: 'You must provide a channel and message to set Main greeting' }

  await mongo.set('discordServer', { _id: obj.guild_id }, { welcome: tempObj })
  return { content: `Main greeting message was updated for <#${tempObj.chId}> and is **${tempObj.status ? 'enabled':'disabled'}**`}
}
