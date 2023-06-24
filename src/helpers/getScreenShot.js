'use strict'
const URI = process.env.WEBRENDER_URI || 'http://172.20.1.35:3000'
const path = require('path')
const fetch = require('node-fetch')
const parseResponse = async(res)=>{
  try{
    const arrayBuffer = await res?.arrayBuffer()
    return await Buffer.from(arrayBuffer)
  }catch(e){
    console.error(e);
  }
}
module.exports = async(html, width = 800, resizeImg = false)=>{
  try{
    let body = { html: html, width: width, resizeImg: resizeImg}
    const res = await fetch(path.join(URI, 'web'), {
      method: 'POST',
      body: JSON.stringify(body),
      compress: true,
      timeout: 60000,
      headers: {'Content-Type': 'application/json'}
    })
    if(res) return await parseResponse(res)
  }catch(e){
    console.error(e);
  }
}
