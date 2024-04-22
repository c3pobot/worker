'use strict'
const log = require('logger')
const formatGuild = require('src/format/formatGuild');
const getGuildId = require('./getGuildId');
const getGuildMembers = require('./getGuildMembers');
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
  let guild = await cache.get('guildCache', guildId)
  if(!guild){
    needsFormat = true
    guild = await queryGuild({ guildId: guildId, includeActivity: true })
    if(guild?.member?.length > 0) guild.member = guild.member.filter(x=>x.memberLevel > 1)
  }
  let timeStart = Date.now()
  if(guild?.member?.length > 0) members = await getGuildMembers(guild.member, projection)
  let timeEnd = Date.now()
  log.debug(`guild pull took ${(timeEnd - timeStart) / 1000} seconds`)
  if(guild?.member?.length !== members?.length) return
  if(needsFormat){
    await formatGuild(guild, members)
    await cache.set('guildCache', guildId, JSON.stringify(guild))
  }
  guild.member = members
  return guild
}
