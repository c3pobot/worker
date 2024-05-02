'use strict'
const botRequest = require('../botRequest')

module.exports = async(obj = {}, msg2send)=>{
  if(!obj.sId || !obj.chId || !msg2send) return
  let files = [], method = obj.method || 'sendMsg', tempObj = { content: msg2send.content || null }
  if(msg2send.components) tempObj.components = msg2send.components
  if(msg2send?.file && msg2send?.fileName){
    files.push({file: msg2send.file.toString('base64'), filename: msg2send.fileName})
  }
  if(msg2send?.files?.length > 0){
    for(let i in msg2send.files) files.push({file: msg2send.files[i].file.toString('base64'), filename: msg2send.files[i].fileName})
  }
  return await botRequest(method, { sId: obj.sId, chId: obj.chId, files: files, msgId: obj.msgId, msg: tempObj })
}
