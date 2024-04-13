'use strict'
const log = require('logger')
const processAPIRequest = require('../processAPIRequest');
const mongo = require('mongoclient')
const google = require('./google')
const codeAuth = require('./codeAuth')
const confirmButton = require('helpers/confirmButton')
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
  try{
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
  }catch(e){
    log.error(e)
  }
}
const getIdentity = async(uid, type, newIdentity = false)=>{
  try{
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
        if(encrypted_ssaid) ssaid = await Google.Decrypt(encrypted_ssaid.ssaid)
        if(!ssaid) log.error(`Guest Auth Credentials lost for ${uid}`)
        if(ssaid) auth = await getGuestAuth(ssaid)
      }
      if(type === 'codeAuth') auth = await codeAuth(uid)
    }else{
      let tempAuth = (await mongo.find('identity', {_id: uid}, {_id:0, TTL: 0}))[0]
      if(tempAuth?.auth?.authId && tempAuth?.auth?.authToken) auth = tempAuth?.auth
    }
    return await getAuthObj(uid, auth)
  }catch(e){
    log.error(e)
  }
}
module.exports = async(obj, method, dObj, payload, loginConfirm = null)=>{
  try{
    let data, status = 'ok', forceNewIdentity = false, msg2send = 'Using this command will temporarly log you out of the game on your device.\n Are you sure you want to do this?'
    if(loginConfirmed === 'no'){
      return {msg2send: 'Command Canceled'}
    }
    if(loginConfirmed === 'yes'){
      forceNewIdentity =  true
      loginConfirmed = 'no'
    }
    let identity = await GetIdentity(dObj.uId, dObj.type, forceNewIdentity)
    if(identity?.error) return ({status: 'error', error: 'invalid_grant'})
    if(identity?.description) return({status: 'error', error: identity?.description})
    if(identity?.auth?.authId && identity?.auth?.authToken) data = await processAPIRequest(method, payload, identity)
    if((!data || (data?.code && reAuthCodes[data?.code])) && loginConfirmed != 'no'){
      await confirmButton(obj, msg2send)
      return 'GETTING_CONFIRMATION'
    }
    if(data){
      if(data.code){
        return ({status: status, error: data})
      }else{
        return ({status: status, data: data})
      }
    }
  }catch(e){
    throw(e)
  }
}
