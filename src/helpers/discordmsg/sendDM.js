'use strict'
const botRequest = require('../botRequest')

module.exports = async(obj = {}, msg2send)=>{
  if(typeof msg2send != 'object' && typeof msg2send == 'string') msg2send = { content: msg2send }
  let payload = { sId: obj.sId, dId: obj.dId, msg: msg2send }
  if(!payload.sId) payload.podName = 'bot-0'
  return await botRequest('sendDM' , payload)
}
