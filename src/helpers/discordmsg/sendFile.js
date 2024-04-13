'use strict'
const ReportError = require('./reportError')
const SendBotMsg = require('./sendBotMsg')
module.exports = async(opts = {}, msg2send)=>{
  try{
    if(opts.sId > 9999 && opts.chId > 9999){
      let files = [], method = 'sendMsg'
      if(opts.method) method = opts.method
      const tempObj = {content: msg2send.content || null}
      if(msg2send.components) tempObj.components = msg2send.components
      if(msg2send?.file && msg2send?.fileName){
        files.push({file: msg2send.file.toString('base64'), filename: msg2send.fileName})
      }
      if(msg2send?.files?.length > 0){
        for(let i in msg2send.files) files.push({file: msg2send.files[i].file.toString('base64'), filename: msg2send.files[i].fileName})
      }
      return await SendBotMsg({sId: opts.sId}, {method: method, chId: opts.chId, files: files, msgId: opts.msgId, msg: tempObj})
    }
  }catch(e){
    console.error(e)
  }
}
