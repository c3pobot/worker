const log = require('logger')
const discordFetch = require('./discordFetch')
const FormData = require('form-data');
const BASE_URI = `/webhooks/${process.env.DISCORD_CLIENT_ID}`
const sendFile = async(token, msg2send, method = 'POST')=>{
  try{
    if(!token || (!msg2send.file && !msg2send.files)) return
    let uri = `${BASE_URI}/${token}`, tempObj = { content: msg2send.content || null }, form = new FormData()
    if(method === 'PATCH') uri += '/messages/@original'
    if(msg2send.components) tempObj.components = msg2send.components
    if(msg2send.files){
      for(let i in msg2send.files){
        form.append('file'+(+i + 1), msg2send.files[i].file, msg2send.files[i].fileName)
      }
    }else{
      form.append('file', msg2send.file, msg2send.fileName)
    }
    form.append('payload_json', JSON.stringify(tempObj))

    let obj = await discordFetch(uri, method, form, {})
    if((obj?.status !== 200 && obj?.status) || obj?.error){
      log.error(JSON.stringify(obj))
      return
    }
    return obj?.body
  }catch(e){
    log.error(e)
  }
}
const sendMsg = async(token, msg2send, method = 'POST')=>{
  try{
    if(!token || !msg2send) return
    if(typeof msg2send != 'object' && typeof msg2send == 'string') msg2send = { content: msg2send }
    if(!msg2send.content) msg2send.content = null
    if(!msg2send.components) msg2send.components = []
    let uri = `${BASE_URI}/${token}`
    if(method === 'PATCH') uri += '/messages/@original'
    let obj = await discordFetch(uri, method, JSON.stringify(msg2send), {"Content-Type": "application/json"})
    if((obj?.status !== 200 && obj?.status) || obj?.error){
      log.error(JSON.stringify(obj))
      if(obj?.status > 300 && (obj?.body?.embeds || obj?.body?.content)){
        await discordFetch(uri, method, JSON.stringify({content: 'Your command was successful. however there was an error displaying the results. It may be that there is too much data to display'}), {"Content-Type": "application/json"})
      }
      return
    }
    return obj?.body
  }catch(e){
    log.error(e)
  }
}
module.exports.File = async(token, msg2send, method = 'POST')=>{
  if(!token || !msg2send) return
  return await sendFile(token, msg2send, method)
}
module.exports.Msg = async(token, msg2send, method = 'POST')=>{
  if(!token || !msg2send) return
  return await sendMsg(token, msg2send, method)
}
