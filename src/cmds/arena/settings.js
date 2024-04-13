'use strict'
const mongo = require('mongoclient')
const { GetChannel } = require('src/helpers/discordmsg')
const { getOptValue } = require('src/helpers')

module.exports = async(obj = {}, patreon = {}, opt = [])=>{
  let msg2send = {content: 'correct info not provided'}, channelPerm = 1
  let chId = getOptValue(opt, 'channel')
  if(chId){
    let checkPerm = await GetChannel(chId)
    if(!checkPerm || !checkPerm.id) channelPerm = 0
  }
  if(!channelPerm) msg2send.content = 'Sorry i do not have permissions to view <#'+chId+'>. You need to fix this before you can use that channel'
  if(channelPerm){
    if(chId){
      await mongo.set('patreon', {_id: patreon._id}, {chId: chId, sId: obj.guild_id})
      msg2send.content = '<#'+chId+'> was set as log channel for you users to use'
    }else{
      await mongo.unset('patreon', {_id: patreon._id}, {chId: patreon.chId, sId: patreon.sId})
      msg2send.content = 'You have removed the log channel for your users'
    }
  }
  return msg2send
}
