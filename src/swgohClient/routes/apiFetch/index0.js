'use strict'
const fetch = require('node-fetch')
const path = require('path')
const GAME_CLIENT_URL = process.env.GAME_CLIENT_URL || 'http://localhost:3000'
const ACCESS_KEY = process.env.ACCESS_KEY
const SECRET_KEY = process.env.SECRET_KEY
const signPostRequest = require('./signPostRequest')
const GETRoutes = {'enums': 'enums'}
const parseResponse = async(res)=>{
  try{
    if(!res) return
    let body
    if (res.status?.toString().startsWith('5')) throw('Bad status code '+res.status)
    if (res.headers?.get('Content-Type')?.includes('application/json')){
      body = await res.json()
    }else{
      body = await res.text()
    }
    if(!body && res.status === 204) body = { status: 204 }
    return { status: res.status, body: body }
  }catch(e){
    console.error(e);
  }
}
const fetchRequest = async(uri, body = {})=>{
  try{
    let headers = {"Content-Type": "application/json"}, method = 'POST'
    if(GETRoutes[uri]) method = 'GET'
    if(ACCESS_KEY && SECRET_KEY) signPostRequest('/'+uri, headers, body, method)
    let payload = { method: method, timeout: 60000, compress: true, headers: headers, body: JSON.stringify(body) }
    let obj = await fetch(path.join(GAME_CLIENT_URL, uri), payload)
    return await parseResponse(obj)
  }catch(e){
    if(e.name){
      return {error: e.name, message: e.message, type: e.type}
    }else{
      if(e?.status){
        return await parseResoponse(e)
      }
      console.error(e)
    }
  }
}
const apiRequest = async(uri, body, count = 0)=>{
  try{
    if(!uri) return
    let res = await fetchRequest(uri, body)
    if(!res) return
    if((res.body?.code === 6 && count < 4) || (res.error === 'FetchError' && count < 4) || (res.status === 400 && res.body?.message && !res.body?.code && count < 4)){
      count++
      return await apiRequest(uri, body, count)
    }
    return res
  }catch(e){
    throw(e)
  }
}
module.exports = async(uri, payload, identity = null)=>{
  try{
    let body = {}
    if(payload) body.payload = payload
    if(identity) body.identity = identity
    let res = await apiRequest(uri, body)
    if(res?.body?.message && res?.body?.code !== 5) console.error(uri+' : Code : '+res.body.code+' : Msg : '+res.body.message)
    if(res?.body) return res.body
    if(res?.error) console.error(console.log(uri+' : '+JSON.stringify(res)))
  }catch(e){
    throw(e)
  }
}
