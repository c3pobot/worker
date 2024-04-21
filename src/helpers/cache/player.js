'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const redis = require('./redis')
const project = require('./project')

const playerCache = require('./playerId')
const guildIdCache = require('./guildId')

const updateIdCache = async(playerId, obj = {})=>{
  try{
    let allyCode = obj.allyCode
    if(!allyCode || !playerId) return
    playerIdCache.set(playerId, allyCode)
    guildIdCache.set(playerId, allyCode, obj)
  }catch(e){
    log.error(e)
  }
}
const redisGet = async(playerId, allyCode, projection)=>{
  let key = playerId || allyCode
  let res = redis.getJSON(key)
  if(res && projection) return project(res, projection)
  return res
}
const redisSet = async(playerId, allyCode, data = {} )=>{
  try{
    let res = await Promise.allSettled([redis.setJSON(playerId, data), redis.setJSON(allyCode, data)])
    if(res?.filter(x=>x.value === 'OK').length === 2) return true
    return
  }catch(e){
    log.error(e)
  }
}
const mongoGet = async(collection, playerId, allyCode, projection)=>{
  let query = {}
  if(playerId){
    query._id = playerId
  }else{
    if(allyCode) query.allyCode = +allyCode
  }
  return (await mongo.find(collection, query, projection))[0]
}
const mongoSet = async(collection, playerId, data)=>{
  try{
    return await mongo.set(collection, { _id: playerId }, data)
  }catch(e){
    log.error(e)
  }
}
module.exports.get = async(collection, playerId, allyCode, projection)=>{
  if(!playerId && !allyCode) return
  if(collection === 'playerCache') return await redisGet(playerId, allyCode, projection)
  return await mongoGet(collection, playerId, allyCode, projection)
}
module.exports.set = async(collection, playerId, data)=>{
  if(!collection || !playerId || !data) return

  let pObj = JSON.parse(data)
  if(!pObj?.allyCode) return
  updateIdCache(playerId, pObj)
  if(collection === 'playerCache') return await redisSet(playerId, pObj.allyCode?.toString(), pObj)
  return await mongoSet(collection, playerId, pObj)
}
