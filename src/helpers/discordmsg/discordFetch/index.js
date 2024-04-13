'use strict'
const fetch = require('node-fetch')
const parseResponse = require('./parseResponse')
const discordUrl = process.env.DISCORD_PROXY_URI || 'https://discord.com'
console.log('Discord Fetch Proxy : '+discordUrl)
const discordRequest = async(uri, method, body, headers)=>{
  try{
    const res = await fetch(discordUrl+'/api'+uri, {
      headers: headers,
      method: method,
      body: body,
      timeout: 30000,
      compress: true
    })
    return await parseResponse(res)
  }catch(e){
    if(e?.name) return {error: e.name, message: e.message, type: e.type}
    if(e?.status) return await parseResponse(e)
    console.error(e)
  }
}
const apiRequest = async(uri, method, body, headers = null, retry = true, count = 0)=>{
  try{
    let res = await discordRequest(uri, method, body, headers)
    if(res?.error && count < 6 && retry){
      count++
      return await apiRequest(uri, method, body, headers, retry, count)
    }
    return res
  }catch(e){
    console.error(e);
  }
}
module.exports = async(uri, method, body, headers = null, retry = true)=>{
  try{

    if(uri){
      let res = await apiRequest(uri, method, body, headers, retry)
      if(res?.status > 300){
        console.error(method+': '+uri)
        console.error(JSON.stringify(res))
        return
      }
      return res
    }
  }catch(e){
    console.error(e);
  }
}
