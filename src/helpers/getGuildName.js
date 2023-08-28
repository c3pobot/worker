'use strict'
let swgohClient
module.exports = async(id)=>{
  try{
    if(!swgohClient) swgohClient = require('swgohClient')
    let guild = await swgohClient('queryGuild',{guildId: id}, null)
    if(guild){
      let gObj = { guildId: id, guildName: guild.guild.profile.name }
      return gObj
    }
  }catch(e){
    throw(e)
  }
}
