'use strict'
const swgohClient = require('src/swgohClient')
const { calcGuildStats } = require('src/helpers')
module.exports = async(guildId, joined = [], projection)=>{
  if(!guildId) return
  let gObj = await swgohClient.post('fetchTWGuild', { guildId: guildId, projection: projection })
  if(!gObj?.member) return
  if(joined?.length > 0){
    gObj.member = gObj.member.filter(x=>joined.includes(x.playerId))
    calcGuildStats(gObj, gObj.member)
  }
  return gObj
}
