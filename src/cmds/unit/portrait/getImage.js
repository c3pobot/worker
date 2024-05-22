'use strict'
const log = require('logger')
const fetch = require('node-fetch')
const parseResponse = async(res)=>{
  try{
    if(res?.status?.toString().startsWith(4)) throw('Fetch Error')
    if(!res?.status?.toString().startsWith('2')) return
    if(res.headers?.get('Content-Disposition')?.includes('filename') || res.headers?.get('Content-Type')?.includes('image') ){
      let buff = await res.arrayBuffer()
      return Buffer.from(buff)?.toString('base64')
    }
  }catch(e){
    log.error(e)
  }
}
module.exports = async(uri, method = 'GET', body, headers)=>{
  try{
    let payload = { method: method, compress: true, timeout: 60000 }
    if(body) payload.body = JSON.stringify(body)
    if(headers) payload.headers = headers
    let res = await fetch(uri, payload)
    return await parseResponse(res)
  }catch(e){
    log.error(e);
  }
}
