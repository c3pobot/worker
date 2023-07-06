'use strict'
const { redis } = require('helpers')
const apiFetch = require('./apiFetch')
module.exports = async(opts = {})=>{
  try{
    let guildId = opts.guildId
    if(!guildId){
      if(+opts.id > 999999){
        let pObj = await redis.get('gId-'+opts.id)
        if(!pObj?.guildId) pObj = await apiFetch('player', {allyCode: opts.id.toString()})
        if(pObj.guildId) guildId = pObj.guildId
      }else{
        guildId = opts.id
      }
    }
    return guildId
  }catch(e){
    console.error(e)
  }
}
