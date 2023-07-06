'use strict'
const fetch = require('node-fetch')
const parseResponse = async(res)=>{
  try{
    if(!res) return
    if (res.status?.toString().startsWith('5')) {
      throw('Bad status code '+res.status)
    }
    let body
    if (res.headers?.get('Content-Type')?.includes('application/json')) {
      body = await res?.json()
    } else {
      body = await res?.text()
    }
    if(!body && res?.status === 204) body = res.status

    return body
  }catch(e){
    console.error(e);
  }
}
module.exports = async(url, method = 'GET', body, headers = {})=>{
  try{
    const req = { method: method, timeout: 60000, compress: true, headers: {'Content-Type': 'application/json'}, compress: true}
    req.headers = {...req.headers,...headers}
    if(body) req.body = body
    const obj = await fetch(url, req)
    return await parseResponse(obj)
  }catch(e){
    console.error(e);
  }
}
