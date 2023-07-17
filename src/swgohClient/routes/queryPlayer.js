'use strict'
const apiFetch = require('./apiFetch')
module.exports = async(opts = {})=>{
  try{
    let payload = { allyCode: opts.allyCode?.toString(), playerId: opts.playerId }
    if(payload.playerId) delete payload.allyCode
    let res = await apiFetch('player', payload)
    return res
  }catch(e){
    throw(e)
  }
}
