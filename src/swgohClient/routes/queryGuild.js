'use strict'
const apiFetch = require('./apiFetch')
module.exports = async(opts = {})=>{
  try{
    if(!opts.guildId) return
    let res = await apiFetch('guild', {guildId: opts.guildId, includeRecentGuildActivityInfo: true})
    return res?.guild
  }catch(e){
    throw(e)
  }
}
