'use strict'
const processAPIRequest = require('../processAPIRequest')
module.exports = async(guildId, includeActivity = false)=>{
  try{
    if(guildId) return await processAPIRequest('guild', {guildId: guildId, includeRecentGuildActivityInfo: includeActivity})
  }catch(e){
    throw(e)
  }
}
