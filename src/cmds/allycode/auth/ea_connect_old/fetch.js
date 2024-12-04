'use strict'
const log = require('logger')
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
    throw(e);
  }
}
module.exports = async(uri, payload = {}, headers = {})=>{
  try{
    let reqHeaders = JSON.parse(JSON.stringify(defaultHeaders))
    if(headers) reqHeaders = {...reqHeaders,...headers}
    let reqBody = JSON.parse(JSON.stringify(defaultBody))
    if(payload) reqBody = {...reqBody,...payload}

    let obj = await fetch(`${baseStoreUrl}/${uri}`, {
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
          let tempRes = checkCookie(cookies[i])
          if(tempRes) res = {...res, ...tempRes}
        }
      }
      return res
    }
  }catch(e){
    log.error(e);
  }
}
