'use strict'
const mongo = require('mongoclient')
module.exports.set = async(collection, guildId, data)=>{
  try{
    if(!collection || !guildId || !data) return
    return await mongo.set(collection, { _id: guildId }, JSON.parse(data))
  }catch(e){
    throw(e)
  }
}
module.exports.get = async(collection, guildId, projection)=>{
  try{
    if(!collection || !guildId) return
    let res = (await mongo.find(collection, { _id: guildId }, projection))[0]
    if(res) return res
  }catch(e){
    throw(e)
  }
}
