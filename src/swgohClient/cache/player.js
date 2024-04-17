'use strict'
const mongo = require('mongoclient')

module.exports.set = async(collection, playerId, data)=>{
  if(!collection || !playerId || !data) return
  return await mongo.set(collection, { _id: playerId }, JSON.parse(data))
}
module.exports.get = async(collection, playerId, allyCode, projection)=>{
  if(!playerId && !allyCode) return;
  let query = {}
  if(playerId){
    query._id = playerId
  }else{
    if(allyCode) query.allyCode = +allyCode
  }
  let res = (await mongo.find(collection, query, projection))[0]
  if(res) return res
}
