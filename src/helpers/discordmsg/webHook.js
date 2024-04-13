const path = require('path')
const bottleneck = require('bottleneck')
const fetch = require('node-fetch')
const ReportError = require('./reportError')
const FormData = require('form-data');
//const discordUrl = process.env.DISCORD_PROXY || 'https://discord.com'
//const baseUrl = discordUrl+'/api/webhooks/'+process.env.DISCORD_CLIENT_ID
const baseUrl = path.join('https://discord.com', 'api', 'webhooks', process.env.DISCORD_CLIENT_ID)
const limiter = new bottleneck({
  minTime: 40
})
console.log('Discord WebHook Proxy : '+baseUrl)
const headers2get = ['x-ratelimit-bucket', 'x-ratelimit-limit', 'x-ratelimit-remaining', 'x-ratelimit-reset', 'x-ratelimit-reset-after']
const parseResoponse = async(res)=>{
  try{
    if(res){
      if (res?.status?.toString().startsWith('5')) {
        throw('Bad status code '+res.status)
      }
      let body, headers = {}

      if (res?.status === 204) {
        body = null
      } else if (res?.headers?.get('Content-Type')?.includes('application/json')) {
        body = await res?.json()
      } else {
        body = await res?.text()
      }
      if(res.headers){
        for(let i in headers2get){
          headers[headers2get[i]] = await res.headers?.get(headers2get[i])
        }
      }
      return {
        status: res?.status,
        body: body,
        headers: headers
      }
    }
  }catch(e){
    console.error(e);
  }
}
const Send = async(uri, method, body, headers)=>{
  try{
    const res =  await fetch(uri, {
      headers: headers,
      method: method,
      body: body,
      timeout: 30000,
      compress: true
    })
    return await parseResoponse(res)
  }catch(e){

    if(e?.name){
      return {error: e.name, message: e.message, type: e.type}
    }else{
      if(e?.status) return await parseResoponse(e)
    }
  }
}
const SendFile = async(token, msg2send, method = 'POST')=>{
  try{
    if(token && ((msg2send.file && msg2send.fileName) || (msg2send.files && msg2send.files.length > 0))){
      const tempObj = {content: msg2send.content || null}
      if(msg2send.components) tempObj.components = msg2send.components
      const form = new FormData()
      if(msg2send.files){
        for(let i in msg2send.files){
          form.append('file'+(+i + 1), msg2send.files[i].file, msg2send.files[i].fileName)
        }
      }else{
        form.append('file', msg2send.file, msg2send.fileName)
      }
      form.append('payload_json', JSON.stringify(tempObj))
      const obj = await Send(baseUrl+'/'+token+''+(method == 'PATCH' ? '/messages/@original':''), method, form, {})
      if((obj?.status !== 200 && obj?.status) || obj.error){
        console.error(JSON.stringify(obj))
        return
      }
      return obj?.body
    }else{
      if(process.env.LOG_LEVEL === 'debug'){
        let msg = ''
        if(!token) msg += '\nNo Token'
        if(!msg2send.files){
          if(!msg2send.file) msg +='\nNo file'
          if(!msg2send.fileName) msg += '\nNo fileName'
        }
        if(msg2send.files && msg2send.files.length === 0) msg += '\nNo files'
        HP.ReportError({cmd: 'WebHookFile'}, msg)
      }
    }
  }catch(e){
    console.error(e);
  }
}
const SendMsg = async(token, msg2send, method = 'POST')=>{
  try{
    if(token && msg2send){
      if(typeof msg2send != 'object' && typeof msg2send == 'string') msg2send = {content: msg2send}
      if(!msg2send.content) msg2send.content = null
      if(!msg2send.components) msg2send.components = []
      const obj = await Send(baseUrl+'/'+token+''+(method == 'PATCH' ? '/messages/@original':''), method, JSON.stringify(msg2send), {"Content-Type": "application/json"})
      if((obj?.status !== 200 && obj?.status) || obj.error){
        console.error(JSON.stringify(obj))
        if(obj?.status > 300 && (obj?.body?.embeds || obj?.body?.content)){
          await Send(baseUrl+'/'+token+''+(method == 'PATCH' ? '/messages/@original':''), method, JSON.stringify({content: 'Your command was successful. however there was an error displaying the results. It may be that there is too much data to display'}), {"Content-Type": "application/json"})
        }
        return
      }
      return obj?.body
    }
  }catch(e){
    console.error(e);
  }
}
module.exports.File = async(token, msg2send, method = 'POST')=>{
  try{
    return await SendFile(token, msg2send, method)
  }catch(e){
    console.error(e);
  }
}
module.exports.Msg = async(token, msg2send, method = 'POST')=>{
  try{
    return await SendMsg(token, msg2send, method)
  }catch(e){
    console.error(e);
  }
}
