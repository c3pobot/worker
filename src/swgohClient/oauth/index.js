'use strict'
const processAPIRequest = require('./processOauthRequest');
const mongo = require('mongoclient')
const google = require('./google')
const codeAuth = require('./codeAuth')
const confirmButton = require('src/helpers/confirmButton')

const reAuthCodes = {
  4: 'SESSIONEXPIRED',
  5: 'AUTHFAILED',
  11: 'UNAUTHORIZED',
  51: 'FORCECLIENTRESTART',
  55: 'PRIORITYFORCECLIENTRESTART'
}
const getGoogleAuth = async(uid, accessToken)=>{
  try{
    return await processAPIRequest('authGoogle', { oauthToken: accessToken, guestId: uid })
  }catch(e){
    log.error(e)
  }
}
const getGuestAuth = async(uid)=>{
  try{
    return await processAPIRequest('authGuest', { uid: uid})
  }catch(e){
    log.error(e)
  }
}
const getAuthObj = async(uid, obj = {})=>{
  if(obj.authId && obj.authToken && obj.authToken !== '' && uid){
    let tempObj = {
      auth: {
        authId: obj.authId,
        authToken: obj.authToken,
      },
      deviceId: uid,
      androidId: uid,
      platform: 'Android'
    }
    await mongo.set('identity', {_id: uid}, tempObj)
    return tempObj
  }else{
    return obj
  }
}
const getIdentity = async(uid, type, newIdentity = false)=>{
  if(!uid || !type) return
  let obj, auth, ssaid
  if(newIdentity){
    if(type === 'google'){
      let accessToken = await google.GetAccessToken(uid);
      if(accessToken?.error) return accessToken
      if(accessToken) auth = await getGoogleAuth(uid, accessToken)
    }
    if(type === 'facebook'){
      let encrypted_ssaid = (await mongo.find('facebook', {_id: uid}))[0]
      if(encrypted_ssaid) ssaid = await google.Decrypt(encrypted_ssaid.ssaid)
      if(!ssaid) log.error(`Guest Auth Credentials lost for ${uid}`)
      if(ssaid) auth = await getGuestAuth(ssaid)
    }
    if(type === 'codeAuth') auth = await codeAuth(uid)
  }else{
    let tempAuth = (await mongo.find('identity', {_id: uid}, {_id:0, TTL: 0}))[0]
    if(tempAuth?.auth?.authId && tempAuth?.auth?.authToken) auth = tempAuth?.auth
  }
  if(!auth) return
  return await getAuthObj(uid, auth)
}

module.exports = async(obj = {}, method, dObj = {}, payload)=>{
  let data, status = 'ok', forceNewIdentity = false
  let loginConfirm = obj.confirm?.response
  if(loginConfirm === 'no') return { msg2send: { content: 'Command Canceled' } }
  if(loginConfirm === 'yes'){
    forceNewIdentity =  true
    loginConfirm = 'no'
  }
  let identity = await getIdentity(dObj.uId, dObj.type, forceNewIdentity)
  if(!identity) return await confirmButton(obj, 'Using this command will temporarly log you out of the game on your device.\n Are you sure you want to do this?')
  if(identity?.error) return {status: 'error', error: 'invalid_grant'}
  if(identity?.description) return {status: 'error', error: identity?.description}
  if(identity?.auth?.authId && identity?.auth?.authToken) data = await processAPIRequest(method, payload, identity)
  if(loginConfirm !== 'no' && data?.code && reAuthCodes[data?.code]) return await confirmButton(obj, 'Using this command will temporarly log you out of the game on your device.\n Are you sure you want to do this?')
  /*
  if((!data || (data?.code && reAuthCodes[data?.code])) && loginConfirm !== 'no'){
    await confirmButton(obj, msg2send)
    return 'GETTING_CONFIRMATION'
  }
  */
  if(data){
    if(data.code){
      return ({status: status, error: data})
    }else{
      return ({status: status, data: data})
    }
  }
}
