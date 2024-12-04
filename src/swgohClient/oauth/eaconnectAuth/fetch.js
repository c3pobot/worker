'use strict'
const fetch = require('node-fetch')
const getCookie = (cookie, res = {})=>{
  if(!cookie) return
  let array = cookie?.split('; ')
  if(!array || array?.length == 0) return
  let data = array[0].split('=')
  if(!data || data?.length == 0) return
  res[data[0]] = data[1]?.replace(/\"/g, '')
}
const mapCookies = (cookies)=>{
  let res = {}
  let array = cookies?.split(', ')
  if(!array || array?.length == 0) return
  for (let i in array) getCookie(array[i], res)
  return res
}
const parseResponse = async(res)=>{
  try{
    if(!res) return
    if (res?.status?.toString().startsWith('5')) {
      throw('Bad status code '+res.status)
    }
    let body
    let cookies = mapCookies(res?.headers?.get('set-cookie'))
    if (res?.status === 204) {
      body = null
    } else {
      if (res?.headers?.get('Content-Type')?.includes('application/json')) body = await res?.json()
    }

    return {
      status: res?.status,
      body: body,
      cookies: cookies,
      redirect_uri: res?.headers?.get('location')
    }
  }catch(e){
    throw(e);
  }
}
let retryCount = +process.env.CLIENT_RETRY_COUNT || 6
async function apiRequest(uri, opts){
  try{
    let res = await fetch(uri, opts)
    return await parseResponse(res)
  }catch(e){
    if(e?.name) return { error: e.name, message: e.message }
    if(e?.status) return await parseResponse(e)
    throw(e)
  }
}
async function fetchRetry(uri, opts, count = 0){
  try{
    let res = await apiRequest(uri, opts)
    if(res?.error === 'FetchError'){
      if(count < retryCount){
        count++
        return await fetchRetry(uri, opts, count)
      }else{
        throw(`tried request ${count} time(s) and errored with ${res.error} : ${res.message}`)
      }
    }
    return res
  }catch(e){
    throw(e)
  }
}
module.exports = async(uri, opts = {}, showRes = false)=>{
  try{
    return await fetchRetry(uri, opts, 0)
  }catch(e){
    throw(e)
  }
}
