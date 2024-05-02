'use strict'
const mongo = require('mongoclient')
const getDiscordAC = require('./getDiscordAC')
const guildIdCache = require('./cache/guildId')
const swgohClient = require('src/swgohClient')
module.exports = async(msg = {}, obj = {}, opt = {})=>{
  let dObj, gObj, pObj
  let allyCode = obj.allyCode
  if(!allyCode && msg.dId) dObj = await getDiscordAC(msg.dId, opt)
  if(dObj?.allyCode) allyCode = dObj.allyCode
  if(allyCode) pObj = await guildIdCache.get(null, allyCode)
  if(pObj?.guildId && allyCode) pObj.allyCode = +allyCode
  if(!pObj?.guildId && allyCode) pObj = await swgohClient.post('queryPlayer', {allyCode: allyCode.toString()}, null)
  if(pObj?.guildId) return pObj
}
