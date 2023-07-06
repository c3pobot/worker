'use strict'
const apiFetch = require('./apiFetch')
const mapGuildId = require('./mapGuildId')
module.exports = async(opts = {})=>{
  try{
    let payload = { allyCode: opts.allyCode?.toString(), playerId: opts.playerId }
    if(payload.playerId) delete payload.allyCode
    let res = await apiFetch('player', payload)
    if(res) mapGuildId(res)
    return res
  }catch(e){
    throw(e)
  }
}
