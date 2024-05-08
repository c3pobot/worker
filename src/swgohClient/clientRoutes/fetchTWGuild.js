'use strict'
const formatGuild = require('src/format/formatGuild');
const getGuildId = require('./getGuildId');
const getTWGuildMembers = require('./getTWGuildMembers');
const queryGuild = require('./queryGuild');
const cache = require('src/helpers/cache/guild')
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
  let members, needsFormat = false, projection
  if(opt.projection) projection = {...defaultProjection,...opt.projection}
  let guildId = await getGuildId(opt)
  if(!guildId) return
  let guild = await cache.get('twGuildCache', guildId)
  if(!guild) guild = await cache.get('guildCache', { _id: guildId })
  if(!guild){
    needsFormat = true
    guild = await queryGuild({ guildId: guildId, includeActivity: true})
    if(guild?.member?.length > 0) guild.member = guild.member.filter(x=>x.memberLevel > 1)
  }
  if(guild?.member?.length > 0) members = await getTWGuildMembers(guild.member, projection)
  if(guild?.member?.length !== members?.length) return
  if(needsFormat){
    await formatGuild(guild, members)
    await cache.set('twGuildCache', guildId, JSON.stringify(guild))
  }
  guild.member = members
  if(!opt.doNotReturnData) return guild
}
