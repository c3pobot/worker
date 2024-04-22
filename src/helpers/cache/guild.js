'use strict'
const log = require('logger')
const mongo = require('mongoclient')

module.exports.set = async(collection, guildId, data)=>{
  try{
    if(!collection || !guildId || !data) return
    return await mongo.set(collection, { _id: guildId }, JSON.parse(data))
  }catch(e){
    log.error(e)
  }
}
module.exports.get = async(collection, guildId, projection)=>{
  if(!collection || !guildId) return
  return (await mongo.find(collection, { _id: guildId }, projection))[0]
}
