'use strict'
const log = require('logger')
const mongo = require('mongoclient')
module.exports.set = async(playerId, allyCode, obj = {})=>{
  try{
    if(!playerId || !allyCode) return
    let gObj = { allyCode: +allyCode, playerId: playerId, guildId: obj.guildId, guildName: obj.guildName }
    return await mongo.set('guildIdCache', { _id: playerId }, gObj)
  }catch(e){
    log.error(e)
  }
}
module.exports.get = async(playerId, allyCode)=>{
  if(!playerId && !allyCode) return
  let query = {}
  if(playerId){
    query._id = playerId
  }else{
    if(allyCode) query.allyCode = +allyCode
  }
  return (await mongo.find('guildIdCache', query, { _id: 0, TTL: 0}))[0]
}
