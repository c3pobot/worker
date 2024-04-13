'use strict'
const log = require('logger')
const { WebHookFile, WebHookMsg} = require('./discordmsg')
module.exports = async(obj = {}, content, method = 'PATCH')=>{
  try{
    if(content?.file || content?.files){
      await WebHookFile(obj?.token, content, method)
    }else{
      await WebHookMsg(obj?.token, content, method)
    }
  }catch(e){
    throw(e)
  }
}
