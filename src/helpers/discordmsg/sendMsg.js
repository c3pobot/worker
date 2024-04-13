'use strict'
const SendBotMsg = require('./sendBotMsg')
module.exports = async(opts = {}, content)=>{
  try{
    if(+opts.sId > 9999 && +opts.chId > 9999){
      let msg2send = content, method = 'sendMsg'
      if(opts.method) method = opts.method
      if(typeof content != 'object' && typeof content == 'string') msg2send = {content: content}
      return await SendBotMsg({sId: opts.sId}, {method: method, chId: opts.chId, msgId: opts.msgId, msg: msg2send})
    }
  }catch(e){
    console.error(e)
  }
}
