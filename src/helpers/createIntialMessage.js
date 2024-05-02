'use strict'
const botRequest = require('./botRequest')
module.exports = async(obj = {})=>{
  if(!obj.chId || !obj.sId) return
  return await botRequest('sendMsg', { sId: obj.sId, chId: obj.chId, msg: { embeds: [{ description: "Placeholder", color: 15844367 }] } })
}
