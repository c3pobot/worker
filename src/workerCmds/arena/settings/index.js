'use strict'
const mongo = require('mongoclient')
const { GetAllyCodeFromDiscordId, GetOptValue, ReplyMsg } = require('helpers')
const { GetChannel } = require('discordapiclient')
module.exports = async(obj = {}, patreon = {}, opt = [])=>{
  try{
    let msg2send = {content: 'correct info not provided'}, channelPerm = false
    let chId = GetOptValue(opt, 'channel')
    if(chId){
      msg2send.content = 'Sorry i do not have permissions to view <#'+chId+'>. You need to fix this before you can use that channel'
      let channel = await GetChannel(chId)
      if(channel.id) channelPerm = true
    }else{
      channelPerm = true
    }
    if(channelPerm){
      if(chId){
        await mongo.set('patreon', {_id: patreon._id}, {chId: chId, sId: obj.guild_id})
        msg2send.content = '<#'+chId+'> was set as log channel for you users to use'
      }else{
        await mongo.unset('patreon', {_id: patreon._id}, {chId: patreon.chId, sId: patreon.sId})
        msg2send.content = 'You have removed the log channel for your users'
      }
    }
    await ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
