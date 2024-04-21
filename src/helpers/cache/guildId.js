'use strict'
const log = require('logger')
const redis = require('./redis')
module.exports.set = async(playerId, allyCode, obj = {})=>{
  try{
    if(!playerId || !allyCode || !obj?.guildId || !obj.guildName) return
    let gObj = { allyCode: +allyCode, playerId: playerId, guildId: obj.guildId, guildName: obj.guildName }
    let res = await Promise.allSettled([redis.setJSON(`g-${playerId}`, gObj), redis.setJSON(`g-${allyCode}`, gObj)])
    if(res?.filter(x=>x.value === 'OK').length === 2) return true
  }catch(e){
    log.error(e)
  }
}
module.exports.get = async(playerId, allyCode)=>{
  if(!playerId && !allyCode) return
  let key = playerId || allyCode?.toString()
  return await redis.getJSON(`g-${key}`)
}
