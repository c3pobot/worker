'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const redis = require('src/helpers/redisCache')
const project = require('../clientRoutes/project')
module.exports.set = async(collection, playerId, data)=>{
  try{
    if(!collection || !playerId || !data) return
    let pObj = JSON.parse(data)
    if(!pObj?.allyCode) return
    if(collection === 'playerCache'){
      let res = await Promise.allSettled([redis.set(playerId, pObj), redis.set(pObj.allyCode?.toString(), pObj)])
      if(res?.filter(x=>x.value === 'OK').length === 2) return true
      return
    }
    return await mongo.set(collection, { _id: playerId }, pObj)
  }catch(e){
    log.error(e)
  }
}
module.exports.get = async(collection, playerId, allyCode, projection)=>{
  if(!playerId && !allyCode) return;
  if(collection === 'playerCache'){
    let res
    if(playerId) res = await redis.get(playerId)
    if(!res && allyCode) res = await redis.get(allyCode?.toString())
    if(res?.allyCode && projection) return project(res, projection)
    return res
  }
  let query = {}
  if(playerId){
    query._id = playerId
  }else{
    if(allyCode) query.allyCode = +allyCode
  }
  let res = (await mongo.find(collection, query, projection))[0]
  if(res) return res
}
