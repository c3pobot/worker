'use strict'
const processAPIRequest = require('../processAPIRequest');
const guildIdCache = require('src/helpers/cache/guildId')

module.exports = async(opt = {})=>{
  let guildId = opt.guildId, pObj
  if(opt.guildId) return opt.guildId
  if(opt.id > 999999){
    if(!opt.skipCache) pObj = await guildIdCache.get(null, opt.id)
    if(!pObj?.guildId) pObj = await processAPIRequest('player', { allyCode: opt.id.toString() })
    return pObj?.guildId
  }
  return opt.id
}
