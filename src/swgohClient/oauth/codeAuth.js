'use strict'
const mongo = require('mongoclient')
const google = require('./google')
const fetch = require('node-fetch')
const baseStoreUrl = 'https://store.galaxy-of-heroes.starwars.ea.com'

const defaultBody = { credentials: 'same-origin' }
const defaultHeaders = { "Content-Type": 'application/json' }
const resCookies = ['authToken', 'refreshToken']
const checkCookie = (cookie)=>{
  try{
    let res = {}
    for(let i in resCookies){
      if(cookie.includes(resCookies[i])){
        let array = cookie.split('; ')?.filter(x=>x?.includes(resCookies[i]))
        if(array?.length === 1) res[resCookies[i]] = array[0].replace(resCookies[i]+'=', '')
      }
    }
    return res
  }catch(e){
    log.error(e);
  }
}
const Request = async(path, payload = {}, headers = {})=>{
  let reqHeaders = JSON.parse(JSON.stringify(defaultHeaders))
  if(headers) reqHeaders = {...reqHeaders,...headers}
  let reqBody = JSON.parse(JSON.stringify(defaultBody))
  if(payload) reqBody = {...reqBody,...payload}
  let obj = await fetch(baseStoreUrl+path, {
    method: 'POST',
    timeout: 60000,
    compress: true,
    headers: reqHeaders,
    body: JSON.stringify(reqBody)
  })
  let cookies = obj?.headers?.raw()['set-cookie']
  let resHeader = obj?.headers.get('content-type')
  if(resHeader?.includes('application/json')){
    let res = await obj?.json()
    if(!res) res = {}
    if(cookies?.length > 0){
      for(let i in cookies){
        let tempRes = await checkCookie(cookies[i])
        if(tempRes) res = {...res, ...tempRes}
      }
    }
    return res
  }
}
module.exports = async(uid)=>{
  let res = {}, tokens, decryptedToken, newAuth
  let oldIdentity = (await mongo.find('identity', {_id: uid}))[0]
  if(oldIdentity?.auth?.authToken && oldIdentity?.auth?.authId) tokens = (await mongo.find('tokens', {_id: uid}))[0]
  if(tokens?.refreshToken) decryptedToken = await google.Decrypt(tokens.refreshToken)

  if(decryptedToken) newAuth = await Request('/auth/refresh_session', {}, {
    'X-Rpc-Auth-Id': oldIdentity.auth.authId,
    'Cookie': 'authToken='+oldIdentity.auth.authToken+'; refreshToken='+decryptedToken
  })
  if(newAuth?.authId && newAuth?.authToken && newAuth?.refreshToken){
    let encryptedToken = await google.Encrypt(newAuth.refreshToken)
    if(encryptedToken) await mongo.set('tokens', {_id: uid}, {refreshToken: encryptedToken})
  }
  return newAuth
}
