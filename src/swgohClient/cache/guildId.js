'use strict'
const log = require('logger')
const mongo = require('mongoclient')
module.exports.set = async(playerId, allyCode, obj = {})=>{
  try{
    if(!playerId || !allyCode) return;
    let data = { guildId: obj.guildId, allyCode: +allyCode, playerId: playerId, guildName: obj.guildName}
    if(data.guildId && data.guildName){
      return await mongo.set('guildIdCache', { _id: playerId }, { playerId: playerId, allyCode: +allyCode, guildId: obj.guildId, guildName: obj.guildName })
    }
  }catch(e){
    log.error(e)
  }
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
