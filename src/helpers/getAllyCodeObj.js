'use strict'
const getOptValue = require('./getOptValue')
const getAllyCodeFromDiscordId = require('./getAllyCodeFromDiscordId')
module.exports = async(obj = {}, opt = [])=>{
  try{
    let dObj, res = { mentionError: false }
    res.allyCode = getOptValue(opt, 'allyCode')
    if(res.allyCode) res.allyCode = +(res.allyCode.trim().replace(/-/g, ''))
    let dId = getOptValue(opt, 'user')
    if(!res.allyCode && dId){
      res.dId = dId
      dObj = await getAllyCodeFromDiscordId(res.dId, opt)
      if(!dObj?.allyCode) res.mentionError = true
    }
    if(!dObj && !res.mentionError && obj.member){
      res.dId = obj.member.user.id
      dObj = await getAllyCodeFromDiscordId(obj.member.user.id, opt)
    }
    if(dObj){
      res = { ...res, ...dObj}
      if(res.allyCode) res.allyCode = +res.allyCode
    }
    return res
  }catch(e){
    throw(e)
  }
}
