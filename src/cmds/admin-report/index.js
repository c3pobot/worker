'use strict'
const { botSettings } = require('src/helpers/botSettings')
const { botRequest } = require('src/helpers')
module.exports = async(obj = {}, opt = {})=>{
  if(!obj.msg || !botSettings?.reportSId || !botSettings?.reportChId) return
  let payload = { sId: botSettings.reportSId, chId: botSettings.reportChId, msg: obj.msg }
  if(obj.podName) payload = obj.podName
  botRequest('sendMsg', payload)
}
