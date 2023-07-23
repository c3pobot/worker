'use strict'
const log = require('logger')
const fetch = require('node-fetch')
const path = require('path')
const BOT_BRIDGE_URI = process.env.BOT_BRIDGE_URI
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
    throw(e);
  }
}

module.exports = async(cmd, obj = {})=>{
  try{
    if(!BOT_BRIDGE_URI) throw('BOT_BRIDGE_URI not definied')
    let payload = {method: 'POST', timeout: 30000, compress: true, headers: {'Content-Type': 'application/json'}}
    payload.body = JSON.stringify({...obj,...{cmd: cmd}})
    let res = await fetch(path.join(BOT_BRIDGE_URI, 'cmd'), payload)
    return await parseResponse(res)
  }catch(e){
    throw(e)
  }
}
