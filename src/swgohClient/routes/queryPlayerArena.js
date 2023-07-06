'use strict'
const apiFetch = require('./apiFetch')
module.exports = async(opts = { detailsOnly: false })=>{
  try{
    const payload = { playerDetailsOnly: opts.detailsOnly, allyCode: opts.allyCode?.toString(), playerId: opts.playerId }
    if(payload.playerId) delete payload.allyCode
    return await apiFetch('playerArena', payload)
  }catch(e){
    throw(e)
  }
}
