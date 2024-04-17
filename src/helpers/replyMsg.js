'use strict'
const { WebHookFile, WebHookMsg} = require('./discordmsg')
module.exports = async(obj = {}, content, method = 'PATCH')=>{
  if(content?.file || content?.files){
    await WebHookFile(obj?.token, content, method)
  }else{
    await WebHookMsg(obj?.token, content, method)
  }
}
