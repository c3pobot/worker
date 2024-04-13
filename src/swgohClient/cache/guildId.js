'use strict'
const mongo = require('mongoclient')

module.exports.set = async(playerId, allyCode, guildId)=>{
  try{
    if(!playerId || !allyCode) return;
    return await mongo.set('guildIdCache', { _id: playerId }, { playerId: playerId, allyCode: +allyCode, guildId: guildId })
  }catch(e){
    throw(e)
  }
}
module.exports.get = async(playerId, allyCode)=>{
  try{
    if(!playerId && !allyCode) return;
    let query = {}
    if(playerId){
      query._id = playerId
    }else{
      if(allyCode) query.allyCode = +allyCode
    }
    let res = (await mongo.find('guildIdCache', query))[0]
    if(res?.guildId) return res.guildId
  }catch(e){
    throw(e)
  }
}
