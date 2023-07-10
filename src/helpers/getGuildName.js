'use strict'
const swgohClient = require('swgohClient')
const { redis } = require('./redis')
module.exports = async(id)=>{
  try{
    let gObj = await redis.get('gId-'+id)
    if(gObj) return gObj
    let guild = await swgohClient('queryGuild',{guildId: id}, null)
    if(guild){
      gObj = { guildId: id, guildName: guild.guild.profile.name }
      redis.set('gId-'+id, gObj)
      return gObj
    }    
  }catch(e){
    throw(e)
  }
}
