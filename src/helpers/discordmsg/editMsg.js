'use strict'
const botRequest = require('../botRequest')
module.exports = async(obj = {}, msg2send)=>{
  if(!obj.msgId || !obj.chId || !obj.sId) return
  return await botRequest('editMsg', { sId: obj.sId, chId: obj.chId, msgId: obj.msgId, msg: msg2send })
}
