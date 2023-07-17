'use strict'
const swgohClient = require('swgohClient')
module.exports = async(id)=>{
  try{
    let guild = await swgohClient('queryGuild',{guildId: id}, null)
    if(guild){
      let gObj = { guildId: id, guildName: guild.guild.profile.name }
      return gObj
    }
  }catch(e){
    throw(e)
  }
}
