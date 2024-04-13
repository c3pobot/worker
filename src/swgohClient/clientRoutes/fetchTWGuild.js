'use strict'
'use strict'
const log = require('logger');
const formatGuild = require('./format/formatGuild');
const getGuildId = require('./getGuildId');
const getTWGuildMembers = require('./getTWGuildMembers');
const queryGuild = require('./queryGuild');
const cache = require('../cache/guild')
const defaultProjection = {
  playerId: 1,
  name: 1,
  allyCode: 1,
  gp: 1,
  gpChar: 1,
  gpShip: 1,
  zetaCount: 1,
  sixModCount: 1,
  omiCount: 1
}

module.exports = async(opt = {})=>{
  try{
    let members, needsFormat = false, projection
    if(opt.projection) projection = {...defaultProjection,...opt.projection}
    let guildId = await getGuildId(opt)
    if(!guildId) return
    let guild = await cache.get('twGuildCache', { _id: guildId })
    if(!guild) guild = await guildCache.get('guildCache', { _id: guildId })
    if(!guild){
      needsFormat = true
      guild = await queryGuild(guildId, true)
      if(guild?.guild?.member?.length > 0) guild = guild?.guild
      if(guild?.member?.length > 0) guild.member = guild.member.filter(x=>x.memberLevel > 1)
    }
    if(guild?.member?.length > 0) members = await getTWGuildMembers(guild.member, projection)
    if(guild?.member?.length !== members?.length) return
    if(needsFormat){
      await formatGuild(guild, members)
      await cache.set('twGuildCache', guildId, JSON.stringify(guild))
    }
    guild.member = members
    return guild
  }catch(e){
    log.error(e)
  }
}
