'use strict'
const fetch = require('./fetch')
function getURLParam(url, param){
  if(!url) return
  let params = new URLSearchParams(new URL(url).search);
  return params.get(param)
}
async function getCall(data = {}){
  let headers = { 'Cookie': `JSESSIONID=${data.JSESSIONID}; signin-cookie=${data['signin-cookie']}` }
  let res = await fetch(`https://signin.ea.com/p/juno/nff/login?execution=${data.executionId}s2&initref=${data.initref}`, { method: 'GET', headers: headers })
  return res?.status
}
async function getNXID(data = {}, otc){
  if(!otc) return
  let headers = { 'Cookie': `JSESSIONID=${data.JSESSIONID}; signin-cookie=${data['signin-cookie']}`, 'Content-Type': 'application/x-www-form-urlencoded' }
  let body = new URLSearchParams({
    oneTimeCode: otc,
    _eventId: 'submit'
  })
  let res = await fetch(`https://signin.ea.com/p/juno/nff/login?execution=${data.executionId}s2&initref=${data.initref}`, { redirect: 'manual', method: 'POST', headers: headers, body: body.toString() })
  if(res?.cookies) data['_nx_mpcid'] = res?.cookies['_nx_mpcid']
}
async function getAccessCode(data = {}){
  let headers = { 'Cookie': `_nx_mpcid=${data['_nx_mpcid']}` }, url = 'https://accounts.ea.com/connect/auth?mode=junoNff&client_id=SWGOH_SERVER_WEB_APP&response_type=code&hide_create=true&redirect_uri=https://store.galaxy-of-heroes.starwars.ea.com'
  let res = await fetch(`https://accounts.ea.com/connect/auth?mode=junoNff&client_id=SWGOH_SERVER_WEB_APP&response_type=code&hide_create=true&redirect_uri=https://store.galaxy-of-heroes.starwars.ea.com&fid=${data.fId}`, { redirect: 'manual', method: 'GET', headers: headers })
  data.code = getURLParam(res?.redirect_uri, 'code')
  data.remid = res?.cookies?.remid
}
async function getAuthToken(data = {}){
  let headers = { "Content-Type": "application/json" }
  let body = { access_code: data.code, redirect_uri: "https://store.galaxy-of-heroes.starwars.ea.com" }
  let res = await fetch('https://store.galaxy-of-heroes.starwars.ea.com/auth/access_code', { method: "POST", headers: headers, body: JSON.stringify(body)})
  return { authToken: res?.cookies?.authToken, authId: res?.body?.authId }
}
module.exports = async(data = {}, otc)=>{
  let status = await getCall(data)
  if(status != 200) return
  await getNXID(data, otc)
  if(!data['_nx_mpcid']) return
  await getAccessCode(data)
  if(!data?.code || !data.remid) return
  let identity = await getAuthToken(data)
  if(!identity?.authToken || !identity?.authId) return
  return { auth: identity, remid: data.remid, _nx_mpcid: data['_nx_mpcid'] }
}
