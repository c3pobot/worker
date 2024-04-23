'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const project = require('./project')
const guildIdCache = require('./guildId')
const playerIdCache = require('./playerId')

const updateIdCache = async(playerId, obj = {})=>{
  try{
    let allyCode = +obj.allyCode
    if(!allyCode || !playerId) return
    playerIdCache.set(playerId, allyCode)
    guildIdCache.set(playerId, allyCode, obj)
  }catch(e){
    log.error(e)
  }
}
module.exports.get = async(collection, playerId, allyCode, projection)=>{
  if(!playerId && !allyCode) return
  let query = {}
  if(playerId){
    query._id = playerId
  }else{
    if(allyCode) query.allyCode = +allyCode
  }
  return (await mongo.find(collection, query, projection))[0]
}
module.exports.set = async(collection, playerId, data, cacheId = true)=>{
  try{
    if(!collection || !playerId || !data) return
    let pObj = JSON.parse(data)
    if(!pObj?.allyCode) return
    if(cacheId) updateIdCache(playerId, pObj)
    return await mongo.set(collection, { _id: playerId }, pObj)
  }catch(e){
    log.error(e)
  }
}
