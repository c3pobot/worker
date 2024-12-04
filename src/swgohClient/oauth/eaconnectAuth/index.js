'use strict'
const fetch = require('./fetch')
const mongo = require('mongoclient')
const google = require('../google')

function getURLParam(url, param){
  if(!url) return
  let params = new URLSearchParams(new URL(url).search);
  return params.get(param)
}
async function getAccessCode(data = {}){
  let headers = { 'Cookie': `_nx_mpcid=${data['_nx_mpcid']}; remid=${data.remid}` }, url = 'https://accounts.ea.com/connect/auth?mode=junoNff&client_id=SWGOH_SERVER_WEB_APP&response_type=code&hide_create=true&redirect_uri=https://store.galaxy-of-heroes.starwars.ea.com'
  let res = await fetch(`https://accounts.ea.com/connect/auth?mode=junoNff&client_id=SWGOH_SERVER_WEB_APP&response_type=code&hide_create=true&redirect_uri=https://store.galaxy-of-heroes.starwars.ea.com`, { redirect: 'manual', method: 'GET', headers: headers })
  return { code: getURLParam(res?.redirect_uri, 'code'), remid: res?.cookies?.remid }
}
async function getAuthToken(data = {}){
  let headers = { "Content-Type": "application/json" }
  let body = { access_code: data.code, redirect_uri: "https://store.galaxy-of-heroes.starwars.ea.com" }
  let res = await fetch('https://store.galaxy-of-heroes.starwars.ea.com/auth/access_code', { method: "POST", headers: headers, body: JSON.stringify(body)})
  return { authToken: res?.cookies?.authToken, authId: res?.body?.authId }
}
module.exports = async(uId)=>{
  if(!uId) return
  let data = (await mongo.find('eaconnectTokens', { _id: uId}))[0]
  if(!data?._nx_mpcid || !data?.remid) return
  data.remid = await google.Decrypt(data.remid)
  if(!data.remid) return
  let obj = await getAccessCode(data)
  if(!obj?.code || !obj.remid) return { error: 'expired' }
  let identity = await getAuthToken(obj)
  if(!identity?.authToken || !identity?.authId) return
  let encryptedToken = await google.Encrypt(obj.remid)
  if(!encryptedToken) return
  await mongo.set('eaconnectTokens', { _id: uId }, { _nx_mpcid: data._nx_mpcid, remid: encryptedToken })
  return identity
}
