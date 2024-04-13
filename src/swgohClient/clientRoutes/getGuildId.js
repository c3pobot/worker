'use strict'
const log = require('logger')
const processAPIRequest = require('../processAPIRequest');
const mongo = require('mongoclient')

module.exports = async(opt = {})=>{
  try{
    let guildId = opt.guildId, pObj
    if(!guildId){
      if(opt.id > 999999){
        if(!opt.skipCache) pObj = (await mongo.find('guildIdCache', { allyCode: +opt.id }))[0]
        if(!pObj?.guildId) pObj = await processAPIRequest('player', { allyCode: opt.id.toString() })
        if(pObj.guildId) guildId = pObj.guildId
      }else{
        guildId = opt.id
      }
    }
    return guildId
  }catch(e){
    throw(e)
  }
}
