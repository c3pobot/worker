'use strict'
const mongo = require('mongoclient')
const getOptValue = require('./getOptValue')
module.exports = async(dId, opt = [], useDefault = true)=>{
  let allyObj
  let dObj = (await mongo.find('discordId', {_id: dId}))[0]
  let allyOpt = getOptValue(opt, 'allycode_option')
  if(!allyOpt) allyOpt = 'primary'
  if(dObj && dObj.allyCodes && dObj.allyCodes.length > 0){
    allyObj = dObj.allyCodes.find(x=>x.opt == allyOpt.trim().toLowerCase())
    if(!allyObj){
      if(allyOpt == 'primary'){
        let priAlly = dObj.allyCodes.filter(x=>x.opt != 'alt')
        if(priAlly.length > 0) allyObj = priAlly[0]
      }else{
        let altAlly = dObj.allyCodes.filter(x=>x.opt != 'primary')
        if(altAlly.length > 0) allyObj = altAlly[+altAlly.length - 1]
      }
    }
    if(allyObj) allyObj.dId = dId
  }
  return allyObj
}
