'use strict'
const log = require('logger')
const redis = require('redisclient')
module.exports = async(obj = {})=>{
  try{
    const tempObj = {}
    if(obj.guildId && obj.guildName){
      tempObj.guildId = obj.guildId
      tempObj.guildName = obj.guildName
    }
    if(obj.guild?.profile?.name && obj.guild?.profile?.id){
      tempObj.guildId = obj.guild.profile.id
      tempObj.guildName = obj.guild.profile.name
    }
    if(tempObj.guildId && tempObj.guildName){
      redis.set('gId-'+tempObj.guildId, tempObj)
      if(obj.allyCode) redis.set('gId-'+obj.allyCode, tempObj);
    }else{
      if(obj.allyCode) redis.del('gId-'+obj.allyCode);
    }
  }catch(e){
    log.error(e)
  }
}
