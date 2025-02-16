'use strict'
const log = require('logger')
const rabbitmq = require('src/rabbitmq')

const convertFiles = require('./convertFiles')
const { webHookFile, webHookMsg} = require('./discordmsg')

const checkPermissions = (msg, method = 'PATCH', botPerms)=>{
  try{
    if(!botPerms?.has('ViewChannel')){
      log.debug(`missing ViewChannel permissions`)
      return
    }
    if(msg?.embeds?.length > 0 && !botPerms?.has('EmbedLinks')){
      log.debug(`missing EmbedLinks permissions`)
       return
    }
    if((msg.file || msg.files?.length > 0) && !botPerms?.has('AttachFiles')){
      log.debug(`missing AttachFiles permissions`)
      return
    }
    if(method === 'POST' && !botPerms?.has('SendMessages')){
      log.debug(`missing SendMessages permissions`)
    }
    return true
  }catch(e){
    log.error(e)
  }
}

const sendWebHook = async(token, msg2send, method = 'PATCH')=>{
  if(!token) return
  if(msg2send?.file || msg2send?.files){
    convertFiles(msg2send)
    await webHookFile(token, msg2send, method)
  }else{
    await webHookMsg(token, msg2send, method)
  }
}
module.exports = async(obj = {}, msg2send, method = 'PATCH')=>{
  try{
    if(obj.token && msg2send.flags == 64){
      log.debug(`this is a ephemeral sending with discord api...`)
      return await sendWebHook(obj.token, msg2send, method)
    }
    let msgId = obj.data?.intialResponse?.msgId, podName = obj.podName
    if(!podName && obj.token){
      log.debug(`I do not have a podName for this message, using discord api`)
      return await sendWebHook(obj.token, msg2send, method)
    }
    let hasPermission = checkPermissions(msg2send, method, new Set(obj?.channel?.botPerms || []))
    if(!hasPermission){
      log.debug(`I do not have permissions to reply thru the bot for guild ${obj.guild_id} in channel ${obj.channel_id}, using discord api`)
      await sendWebHook(obj.token, { content: 'I do not have the correct permissions please make sure I have ViewChannel, EmbedLinks, AttachFiles and SendMessages permissions in this channel...' }, 'POST')
      return await sendWebHook(obj.token, msg2send, method)
    }
    return await rabbitmq.notify({ cmd: method, msg: msg2send, sId: obj.guild_id, chId: obj.channel_id, msgId: msgId, podName: podName, token: obj.token }, podName, 'bot.msg')
  }catch(e){
    log.error(e)
  }
}
