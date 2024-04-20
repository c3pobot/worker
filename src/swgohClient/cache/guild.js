'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const redis = require('src/helpers/redisCache')
module.exports.set = async(collection, guildId, data)=>{
  try{
    if(collection === 'guildCache'){
      let res = await redis.set(guildId, JSON.parse(data))
      if(res === 'OK') return true
      return
    }
    if(!collection || !guildId || !data) return
    return await mongo.set(collection, { _id: guildId }, JSON.parse(data))
  }catch(e){
    log.error(e)
  }
}
module.exports.get = async(collection, guildId, projection)=>{
  if(!collection || !guildId) return
  if(collection === 'guildCache') return await redis.get(guildId)
  let res = (await mongo.find(collection, { _id: guildId }, projection))[0]
  if(res) return res
}
