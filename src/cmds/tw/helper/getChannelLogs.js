'use strict'
const swgohClient = require('src/swgohClient')
const { replyTokenError } = require('src/helpers')

module.exports = async(obj = {}, dObj, loginConfirm, channelId)=>{
  let channelAuth = await swgohClient.oauth(obj, 'createGameChannelSession', dObj, {}, loginConfirm)
  if(channelAuth === 'GETTING_CONFIRMATION') return channelAuth
  if(channelAuth?.error == 'invalid_grant'){
    await replyTokenError(obj, dObj.allyCode)
    return 'GETTING_CONFIRMATION';
  }
  if(!channelAuth?.data) return {error: 'Error getting Channel Session'}
  let identity = {
    androidId: dObj.uId,
    auth: channelAuth?.data,
    platform: 'Android',
    deviceId: dObj.uId
  }
  let payload = {
    eventCount: 10000,
    channelEventRequest: [{
      channelId: channelId,
      limit: 100000
    }]
  }
  let logs = await swgohClient.post('getChannelEvents', payload, identity)
  if(logs?.event) return logs
}