'use strict'
const { mongo } = require('helpers/mongo')
const getGuildId =  require('../getGuildId')
const getGuild = require('../getGuild')
const getGuildMembers = require('./getGuildMembers')
const playerCollectionEnum = {guildCache: 'playerCache', twGuildCache: 'twPlayerCache'}
module.exports = async(opts = {})=>{
  try{
    let guildCache = 'twGuildCache', playerCache = 'twPlayerCache', guild, summaryNeeded = false
    if(opts.initial) guildCache = 'guildCache', playerCache = 'playerCache', summaryNeeded = true
    let guildId = await getGuildId(opts)
    if(!guildId) return
    if(opts.initial) guild = (await mongo.find(guildCache, {_id: guildId}, {TTL: 0}))[0]
    if(guild) await mongo.set('twGuildCache', {_id: guild._id}, guild)
    if(!guild) guild = await getGuild({ guildId: guildId, collection: 'twGuildCache', project: opts.guildProject })
    if(!guild.summary) summaryNeeded = true
    if(!guild || !guild?.member ) return
    guild.member = guild.member.filter(x=>x.memberLevel !== 1)
    if(opts.joined?.length > 0) guild.member = guild.member.filter(x=>opts.joined.includes(x.playerId))
    let dataCount = { mod: { r6: 0, 10: 0, 15: 0, 20: 0, 25: 0 }, dataCron: { total: 0 }, gl: { total: 0 }, zeta: 0, gp: 0, gpChar: 0, gpShip: 0 }
    dataCount.quality = { mods: 0, top: 0, gear: 0, total: 0 }
    dataCount.relic = { total: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 }
    dataCount.omi = { total: 0, tw: 0, ga: 0, raid: 0, tb: 0, cq: 0}
    dataCount.gear = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0 }
    dataCount.rarity = { 1: {total: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 }, 2: {total: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 } }
    let players = await getGuildMembers(guildId, guild.member, dataCount, playerCache, summaryNeeded, opts.playerProject)
    if(!players) return
    guild.member = players
    return guild
  }catch(e){
    throw(e);
  }
}
