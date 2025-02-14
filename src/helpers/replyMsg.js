'use strict'
const { webHookFile, webHookMsg} = require('./discordmsg')
const sendBotMsg = require('./sendBotMsg')
/*
module.exports = async(obj = {}, content, method = 'PATCH')=>{
  if(content?.file || content?.files){
    await webHookFile(obj?.token, content, method)
  }else{
    await webHookMsg(obj?.token, content, method)
  }
}
*/
module.exports = async(obj = {}, content, method = 'PATCH')=>{
  await sendBotMsg(obj, content, method)
}
