'use strict'
const processAPIRequest = require('../processAPIRequest');
module.exports = async(opt = {}, detailsOnly = false)=>{
  try{
    let payload = { playerDetailsOnly: detailsOnly, allyCode: opt.allyCode?.toString(), playerId: opt.playerId }
    if(payload.playerId) delete payload.allyCode
    if(payload.allyCode || payload.playerId) return await processAPIRequest('playerArena', payload, null)
  }catch(e){
    throw(e)
  }
}
