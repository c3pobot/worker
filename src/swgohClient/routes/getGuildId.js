'use strict'
const apiFetch = require('./apiFetch')
module.exports = async(opts = {})=>{
  try{
    let guildId = opts.guildId
    if(!guildId){
      if(+opts.id > 999999){
        let pObj = await apiFetch('player', {allyCode: opts.id.toString()})
        if(pObj.guildId) guildId = pObj.guildId
      }else{
        guildId = opts.id
      }
    }
    return guildId
  }catch(e){
    throw(e)
  }
}
