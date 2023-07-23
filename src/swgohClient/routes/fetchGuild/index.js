'use strict'
const { mongo } = require('helpers/mongo')
const getGuildId =  require('../getGuildId')
const getGuild = require('../getGuild')
const getGuildMembers = require('./getGuildMembers')
const playerCollectionEnum = {guildCache: 'playerCache', twGuildCache: 'twPlayerCache'}
module.exports = async(opts = {})=>{
  try{
    let collection = opts.collection || 'guildCache', playerCollection = playerCollectionEnum[collection] || 'playerCache'
    let guildId = await getGuildId(opts)
    if(!guildId) return
    let guild = await getGuild({ guildId: guildId, collection: collection, project: opts.guildProject })
    if(!guild || !guild?.member ) return
    guild.member = guild.member.filter(x=>x.memberLevel !== 1)
    if(opts.excludePlayers && guild.summary) return guild
    let dataCount = { relic: { total: 0 }, omi: { total: 0 },  mod: { r6: 0, 10: 0, 15: 0, 20: 0, 25: 0 }, gear: {}, rarity: { 1: {total: 0 }, 2: {total: 0 } }, dataCron: { total: 0 }, gl: { total: 0 }, zeta: 0, gp: 0, gpChar: 0, gpShip: 0 }
    let players = await getGuildMembers(guildId, guild.member, dataCount, playerCollection, opts.playerProject)
    if(!players) return
    mongo.set(collection, {_id: guildId}, { summary: dataCount })
    if(!opts.excludePlayers) guild.member = players
    return guild
  }catch(e){
    throw(e);
  }
}
