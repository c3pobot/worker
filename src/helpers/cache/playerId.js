'use strict'
const log = require('logger')
const redis = require('./redis')
module.exports.set = async(playerId, allyCode)=>{
  try{
    if(!playerId || !allyCode) return
    let res = await Promise.allSettled([redis.set(`p-${playerId}`, allyCode?.toString()), redis.set(`p-${allyCode}`, playerId)])
    if(res?.filter(x=>x.value === 'OK').length === 2) return true
  }catch(e){
    log.error(e)
  }
}
module.exports.get = async(playerId, allyCode)=>{
  if(!playerId && !allyCode) return
  let key = playerId || allyCode?.toString()
  return await redis.get(`p-${key}`)
}
