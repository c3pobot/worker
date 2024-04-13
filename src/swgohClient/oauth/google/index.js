'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const Cmds = {}
const CryptoJS = require('crypto-js')
const OauthClientWrapper = require('./client')
const client = new OauthClientWrapper({
  client_id: process.env.GOOG_CLIENT_ID,
  client_secrect: process.env.GOOG_CLIENT_SECRET,
  redirect_uri: process.env.GOOG_REDIRECT_URI,
  cache_client: process.env.OAUTH_CLIENT_CACHE || false
})
const GetRefreshToken = async(uid)=>{
  try{
    let refreshToken;
    let obj = (await mongo.find('tokens', {_id: uid}))[0]
    if(obj && obj.refreshToken) refreshToken = await Decrypt(obj.refreshToken)
    return refreshToken
  }catch(e){
    log.error(e)
  }
}
const Decrypt = async(token)=>{
  try{
    return await (CryptoJS.AES.decrypt(token, process.env.GOOG_CLIENT_SECRET)).toString(CryptoJS.enc.Utf8)
  }catch(e){
    log.error(e)
  }
}
const Encrypt = async(token)=>{
  try{
    return await (CryptoJS.AES.encrypt(token, process.env.GOOG_CLIENT_SECRET)).toString()
  }catch(e){
    log.error(e)
  }
}
Cmds.GetAutUrl = async()=>{
  return await client.getUrl()
}
Cmds.GetAccessToken = async(uid)=>{
  let accessToken = await client.getByUid(uid)
  if(!accessToken){
    let refreshToken = await GetRefreshToken(uid)
    if(refreshToken) accessToken = await client.getAccess(uid, refreshToken)
  }
  return accessToken
}
Cmds.SaveRefreshToken = async(uid, refreshToken)=>{
  try{
    let tempObj = {status: 'errorOccured'}
    let encryptedToken = await Encrypt(refreshToken)
    if(encryptedToken){
      await mongo.set('tokens', {_id: uid}, {refreshToken: encryptedToken})
      tempObj.status = 'googleLinkComplete'
    }
    return tempObj
  }catch(e){
    log.error(e)
  }
}

Cmds.NewToken = async(code)=>{
  let uid, accessToken, tempObj
  let tempToken = await client.getTokens(code)
  if(tempToken?.tokens) uid = await client.getUid(tempToken.tokens)
  if(uid && tempToken?.tokens.refresh_token){
    accessToken = await client.newClient(uid, tempToken.tokens.refresh_token)
  }
  if(accessToken) tempObj = {
    refreshToken: tempToken.tokens?.refresh_token,
    accessToken: accessToken,
    uid: uid
  }
  return tempObj
}
Cmds.Decrypt = Decrypt
Cmds.Encrypt = Encrypt
module.exports = Cmds
