'use strict'
const mongo = require('mongoclient')

module.exports.set = async(playerId, allyCode, guildId)=>{
  if(!playerId || !allyCode) return;
  return await mongo.set('guildIdCache', { _id: playerId }, { playerId: playerId, allyCode: +allyCode, guildId: guildId })
}
module.exports.get = async(playerId, allyCode)=>{
  if(!playerId && !allyCode) return;
  let query = {}
  if(playerId){
    query._id = playerId
  }else{
    if(allyCode) query.allyCode = +allyCode
  }
  let res = (await mongo.find('guildIdCache', query))[0]
  if(res?.guildId) return res.guildId
}
