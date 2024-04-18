'use strict'
const mongo = require('mongoclient')
const getDiscordAC = require('./getDiscordAC')
const swgohClient = require('src/swgohClient')
module.exports = async(msg, obj = {}, opt = [])=>{
  let allyCode, dObj, gObj, pObj
  if(obj.allyCode) allyCode = obj.allyCode
  if(!allyCode && msg.dId) dObj = await getDiscordAC(msg.dId, opt)
  if(dObj?.allyCode) allyCode = dObj.allyCode
  if(allyCode) pObj = (await mongo.find('guildIdCache', { allyCode: +allyCode}, {_id: 0, TTL: 0}))[0]
  if(pObj && allyCode) pObj.allyCode = +allyCode
  if(!pObj && allyCode) pObj = await swgohClient.post('queryPlayer', {allyCode: allyCode.toString()}, null)
  if(pObj && pObj.guildId) return pObj
}
