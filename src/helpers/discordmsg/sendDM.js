'use strict'
const SendBotMsg = require('./sendBotMsg')
module.exports = async(dId, content)=>{
  try{
    let msg2send = content, files = []
    if(typeof content != 'object' && typeof content == 'string') msg2send = {content: content}
    msg2send = JSON.parse(JSON.stringify(msg2send))
    delete msg2send.file
    delete msg2send.fileName
    delete msg2send.files
    if(content?.file && content?.fileName){
      files.push({file: content.file.toString('base64'), filename: content.fileName})
    }
    if(content?.files?.length > 0){
      for(let i in content.files) files.push({file: content.files[i].file.toString('base64'), filename: content.files[i].fileName})
    }
    return await SendBotMsg({podName: 'bot-0'} , {method: 'sendDM', dId: dId, files: files, msg: msg2send})
  }catch(e){
    console.error(e)
  }
}
