'use strict'
const botRequest = require('../botRequest')

module.exports = async(obj = {}, msg2send)=>{
  if(!obj.sId || !obj.chId) return
  if(typeof content != 'object' && typeof content == 'string') msg2send = { content: msg2send }
  return await botRequest('sendMsg', { sId: obj.sId, chId: obj.chId, msgId: obj.msgId, msg: msg2send })
}
