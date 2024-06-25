'use strict'
const log = require('logger')
let SWGOHGG_URI = 'https://swgoh.gg/api', retryCount = +process.env.CLIENT_RETRY_COUNT || 6
const fetch = require('node-fetch')

const parseResponse = async(res)=>{
  try{
    if(!res) return
    if (res?.status?.toString().startsWith('5')) {
      throw('Bad status code '+res.status)
    }
    let body

    if (res?.status === 204) {
      body = null
    } else if (res?.headers?.get('Content-Type')?.includes('application/json')) {
      body = await res?.json()
    } else {
      body = await res?.text()
    }
    return {
      status: res?.status,
      body: body
    }
  }catch(e){
    throw(e);
  }
}
const apiRequest = async(uri, opts = {})=>{
  try{
    let res = await fetch(uri, opts)
    return await parseResponse(res)
  }catch(e){
    if(e?.name) return { error: e.name, message: e.message }
    if(e?.status) return await parseResponse(e)
    throw(e)
  }
}

const requestWithRetry = async(uri, opts = {}, count = 0)=>{
  try{
    let res = await apiRequest(uri, opts)
    if(res?.error === 'FetchError'){
      if(count < retryCount){
        count++
        return await requestWithRetry(uri, opts, count)
      }else{
        throw(`tried request ${count} time(s) and errored with ${res.error} : ${res.message}`)
      }
    }
    if(res?.body?.code === 6){
      if(count < retryCount){
        count++
        return await requestWithRetry(uri, opts, count)
      }else{
        throw(`tried request ${count} time(s) and errored with ${res?.body?.code} : ${res?.body?.message}`)
      }
    }
    if(res?.status === 400 && res?.body?.message && !reAuthCodes[res?.body?.code]){
      if(count < retryCount){
        count++
        return await requestWithRetry(uri, opts, count)
      }else{
        throw(`tried request ${count} time(s) and errored with code ${res?.body?.code} : ${res?.body?.message}`)
      }
    }
    return res
  }catch(e){
    throw(e)
  }
}
module.exports = async(uri)=>{
  try{
    let opts = { timeout: 30000, compress: true, method: 'GET' }
    let res = await requestWithRetry(`${SWGOHGG_URI}/${uri}`, opts)
    if(res?.body) return res.body
  }catch(e){
    log.error(e)
  }
}
