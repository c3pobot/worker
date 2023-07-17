'use strict'
const getAllyCodeFromDiscordId = require('./getAllyCodeFromDiscordId')
const swgohClient = require('swgohClient')
module.exports = async(msg, obj = {}, opt = [])=>{
  try{
    let allyCode, dObj, gObj, pObj
    if(obj.allyCode) allyCode = obj.allyCode
    if(!allyCode && msg.dId) dObj = await getAllyCodeFromDiscordId(msg.dId, opt)
    if(dObj && dObj.allyCode) allyCode = dObj.allyCode
    if(allyCode) pObj = await swgohClient('queryPlayer', {allyCode: allyCode.toString()})
    if(pObj && pObj.guildId) return pObj
  }catch(e){
    console.error(e)
  }
}
