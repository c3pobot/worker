'use strict'
const convertFiles = require('./convertFiles')
const { webHookFile, webHookMsg} = require('./discordmsg')
module.exports = async(obj = {}, msg2send, method = 'POST')=>{
  if(!obj.token) return
  if(msg2send?.file || msg2send?.files){
    convertFiles(msg2send)
    await webHookFile(obj.token, msg2send, method)
  }else{
    await webHookMsg(obj.token, msg2send, method)
  }
}
