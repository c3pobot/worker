'use strict'
const fetch = require('node-fetch')

module.exports = async(obj = {})=>{
  try{
    let body = { uri: "http://localhost:3000/portrait/tex.charui_50rt.png", width: 128}, msg2send = {content: 'Error getting image'}
    const img = await fetch('http://172.20.1.35:3000/web', {
      method: 'POST',
      body: JSON.stringify(body),
      compress: true,
      timeout: 60000,
      headers: {'Content-Type': 'application/json'}
    })
    if(img){
      msg2send.file = img.blob()
      msg2send.fileName = 'test.png'
      msg2send.content = null
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e);
    HP.ReplyError(obj)
  }
}
