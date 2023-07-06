'use strict'
const swgohClient = require('swgohClient/routes/apiFetch')
const fetch = require('node-fetch')
const { mongo } = require('helpers/mongo')
const { Decrypt, Encrypt } = require('./googleToken')
const resCookies = ['authToken', 'refreshToken']
const baseStoreUrl = 'https://store.galaxy-of-heroes.starwars.ea.com/auth/refresh_session'
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
    console.error(e);
  }
}
const apiFetch = async(headers = {})=>{
  try{
    let payload = { method: 'POST', timeout: 60000, compress: true, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ credentials: 'same-origin' }) }
    payload.headers = {...payload.header,...JSON.parse(JSON.stringify(headers))}

    const obj = await fetch(baseStoreUrl, payload)
    const cookies = obj?.headers?.raw()['set-cookie']
    const resHeader = obj?.headers.get('content-type')
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
  }catch(e){
    console.error(e);
  }
}

module.exports.getGoogleAuth = async(uid, accessToken)=>{
  try{
    return await swgohClient('authGoogle', { oauthToken: accessToken, guestId: uid })
  }catch(e){
    throw(e)
  }
}
module.exports.getGuestAuth = async(uid)=>{
  try{
    return await swgohClient('authGuest', { uid: uid})
  }catch(e){
    throw(e)
  }
}
module.exports.getCodeAuth = async(uid)=>{
  try{
    let tokens, decryptedToken, newAuth
    let oldIdentity = (await mongo.find('identity', {_id: uid}))[0]
    if(oldIdentity?.auth?.authToken && oldIdentity?.auth?.authId) tokens = (await mongo.find('tokens', {_id: uid}))[0]
    if(tokens?.refreshToken) decryptedToken = await Decrypt(tokens.refreshToken)

    if(decryptedToken) newAuth = await apiFetch({
      'X-Rpc-Auth-Id': oldIdentity.auth.authId,
      'Cookie': 'authToken='+oldIdentity.auth.authToken+'; refreshToken='+decryptedToken
    })
    if(newAuth?.authId && newAuth?.authToken && newAuth?.refreshToken){
      const encryptedToken = await Encrypt(newAuth.refreshToken)
      if(encryptedToken) await mongo.set('tokens', {_id: uid}, {refreshToken: encryptedToken})
    }
    return newAuth
  }catch(e){
    console.error(e);
  }
}
