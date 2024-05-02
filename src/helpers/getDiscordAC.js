'use strict'
const mongo = require('mongoclient')

module.exports = async(dId, opt = {}, useDefault = true)=>{
  let allyObj
  let dObj = (await mongo.find('discordId', { _id: dId }))[0]
  let allyOpt = opt.allycode_option?.value?.trim()?.toLowerCase() || 'primary'
  if(dObj?.allyCodes?.length > 0){
    allyObj = dObj.allyCodes.find(x=>x.opt == allyOpt)
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
