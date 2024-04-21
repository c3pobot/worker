'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const redis = require('./redis')

module.exports.set = async(collection, guildId, data)=>{
  try{
    if(!collection || !guildId || !data) return
    if(collection !== 'guildCache') return (await mongo.set(collection, { _id: guildId }, JSON.parse(data)))
    let res = await redis.setJSON(guildId, JSON.parse(data))
    if(res === 'OK') return true
  }catch(e){
    log.error(e)
  }
}
module.exports.get = async(collection, guildId, projection)=>{
  if(!collection || !guildId) return
  if(collection !== 'guildCache') return (await mongo.find(collection, { _id: guildId }, projection))[0]
  return await redis.getJSON(guildId)
}
