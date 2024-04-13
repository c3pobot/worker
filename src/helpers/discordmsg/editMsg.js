'use strict'
const SendBotMsg = require('./sendBotMsg')
module.exports = async(opts = {}, content)=>{
  try{
    if(opts.msgId > 999999 && opts.chId > 999999){
      let msg2send = content
      if(typeof content != 'object' && typeof content == 'string') msg2send = {content: content}
      msg2send = JSON.parse(JSON.stringify(msg2send))
      delete msg2send.file
      delete msg2send.fileName
      delete msg2send.files
      const payload = {method: 'editMsg', chId: opts.chId, msgId: opts.msgId, msg: msg2send}
      if(content?.file || content.files){
        payload.files = []
        if(content?.file && content?.fileName){
          payload.files.push({file: content.file.toString('base64'), filename: content.fileName})
        }
        if(content?.files?.length > 0){
          for(let i in content.files) payload.files.push({file: content.files[i].file.toString('base64'), filename: content.files[i].fileName})
        }
      }
      return await SendBotMsg({sId: opts.sId}, payload)
    }
  }catch(e){
    console.error(e)
  }
}
