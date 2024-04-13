'use strict'
const redis = require('redisclient')
const swgohClient = require('src/swgohClient')
module.exports = async(id)=>{
  let gObj = await redis.get('gId-'+id)
  if(!gObj){
    const guild = await swgohClient('queryGuild',{guildId: id}, null)
    if(guild){
      gObj = {
        guildId: id,
        guildName: guild.guild.profile.name
      }
      redis.set('gId-'+id, gObj)
    }
  }
  return gObj
}
