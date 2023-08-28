'use strict'
const log = require('logger')
const { GetAccessToken, Decrypt } = require('./googleToken')
const mongo = require('mongoclient')
const { getGoogleAuth, getGuestAuth, getCodeAuth } = require('./getGameAuth')
const GetAuthObj = async (uid, obj = {}) => {
  if(obj.authId && obj.authToken && obj.authToken !== '' && uid){
    const tempObj = {
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
    return(obj)
  }
}
module.exports = async (uid, type, newIdentity = false) => {
  let obj, auth, ssaid
  if (newIdentity) {
    if(type == 'google'){
      const accessToken = await GetAccessToken(uid);
      if (accessToken){
        if(accessToken?.error){
          return accessToken
        }else{
          auth = await getGoogleAuth(uid, accessToken);
        }
      }
    }
    if(type == 'facebook'){
      const encrypted_ssaid = (await mongo.find('facebook', {_id: uid}))[0]
      if(encrypted_ssaid) ssaid = await Decrypt(encrypted_ssaid.ssaid)
      if(ssaid){
        auth = await getGuestAuth(ssaid)
      }else{
        log.info('FB credenitals lost for '+uid)
      }
    }
    if(type == 'codeAuth'){
      if(uid) auth = await getCodeAuth(uid)
    }
  } else {
    const tempAuth = (await mongo.find('identity', {_id: uid}, {_id:0, TTL: 0}))[0]
    if(tempAuth?.auth?.authId && tempAuth?.auth?.authToken) auth = tempAuth?.auth
  };
  return await GetAuthObj(uid, auth)
}
