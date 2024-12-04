const mongo = require('mongoclient')
const fetch = require('./fetch')

function getURLParam(url, param){
  if(!url) return
  let params = new URLSearchParams(new URL(url).search);
  return params.get(param)
}
async function getFid(allyCode){
  let data = {}
  let res = await fetch('https://accounts.ea.com/connect/auth?mode=junoNff&client_id=SWGOH_SERVER_WEB_APP&response_type=code&hide_create=true&redirect_uri=https://store.galaxy-of-heroes.starwars.ea.com', { method: 'GET', redirect: 'manual' })
  if(!res?.redirect_uri) return
  data.fId = getURLParam(res.redirect_uri, 'fid')
  data.allyCode = allyCode
  return data
}
async function getExecution(data = {}){
  let res = await fetch(`https://signin.ea.com/p/juno/nff/login?fid=${data.fId}`, { method: 'GET', redirect: 'manual' })
  if(!res?.redirect_uri || !res?.cookies) return
  data.executionId = getURLParam(res.redirect_uri, 'execution')?.replace('s1', '')
  data.initref = getURLParam(res.redirect_uri, 'initref')
  data.JSESSIONID = res.cookies.JSESSIONID
  data['signin-cookie'] = res.cookies['signin-cookie']
}
async function requestOTC(email, data = {}){

  let headers = { 'Cookie': `JSESSIONID=${data.JSESSIONID}; signin-cookie=${data['signin-cookie']}`, 'Content-Type': 'application/x-www-form-urlencoded' }
  let body = new URLSearchParams({
    email: email,
    _eventId: 'submit',
    _rememberMe: 'on',
    rememberMe: 'on',
    thirdPartyCaptchaResponse: ''
  })
  let res = await fetch(`https://signin.ea.com/p/juno/nff/login?execution=${data.executionId}s1&initref=${data.initref}`, { redirect: 'manual', method: 'POST', headers: headers, body: body.toString()})

  if(!res.redirect_uri) return
  let executionId = getURLParam(res?.redirect_uri, 'execution')
  if(!executionId) return
  if(executionId !== `${data.executionId}s2`) return
  await mongo.set('eaconnectCache', { _id: data.allyCode?.toString() }, data)
  return true
}
module.exports = async(allyCode, email)=>{
  if(!allyCode || !email) return
  let data = await getFid(allyCode)
  if(!data?.fId || !data?.allyCode) return
  await getExecution(data)
  if(!data?.executionId || !data.initref) return
  return await requestOTC(email, data)
}
