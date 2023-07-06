'use strict'
const { mongo } = require('helpers/mongo')
const getOptValue = require('./getOptValue')
module.exports = async(dId, opt = [], useDefault = true)=>{
  try{
    let res
    let dObj = (await mongo.find('discordId', {_id: dId}))[0]
    let allyOpt = getOptValue(opt, 'allycode_option', 'primary')
    if(dObj?.allyCodes?.length > 0){
      res = dObj.allyCodes.find(x=>x.opt?.toLowerCase() === allyOpt?.trim().toLowerCase())
      if(!res){
        if(allyOpt === 'primary'){
          const priAlly = dObj.allyCodes.filter(x=>x.opt != 'alt')
          if(priAlly.length > 0) res = priAlly[0]
        }else{
          const altAlly = dObj.allyCodes.filter(x=>x.opt != 'primary')
          if(altAlly.length > 0) res = altAlly[+altAlly.length - 1]
        }
      }
      if(res) res.dId = dId
    }
    return res
  }catch(e){
    throw(e)
  }
}
