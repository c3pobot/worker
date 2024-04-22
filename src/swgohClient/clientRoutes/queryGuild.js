'use strict'
const processAPIRequest = require('../processAPIRequest')
module.exports = async({guildId, includeActivity = false})=>{
  if(!guildId) return
  let res = await processAPIRequest('guild', {guildId: guildId, includeRecentGuildActivityInfo: includeActivity})
  return res?.guild
}
