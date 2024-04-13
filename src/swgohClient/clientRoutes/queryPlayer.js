'use strict'
const processAPIRequest = require('../processAPIRequest');
module.exports = async(opt = {})=>{
  try{
    let payload = { allyCode: opt.allyCode?.toString(), playerId: opt.playerId }
    if(payload.playerId) delete payload.allyCode
    if(payload.allyCode || payload.playerId) return await processAPIRequest('player', payload)
  }catch(e){
    throw(e)
  }
}
