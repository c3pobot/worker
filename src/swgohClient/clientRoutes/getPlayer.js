'use strict'
const log = require('logger')
const queryPlayer = require('./queryPlayer');
const formatPlayer = require('./format/formatPlayer');
const calcRosterStats = require('../calcRosterStats');
const playerCache = require('../cache/player');
const guildIdCache = require('../cache/guildId');
const dataProject = require('./project');

module.exports = async(payload = {}, opt = {}, cachGuildId = true)=>{
  try{
    let collection = opt.collection || 'playerCache'
    let data = await queryPlayer(payload)
    if(!data?.rosterUnit || data.rosterUnit.length === 0) return
    let stats = calcRosterStats(data)
    if(!stats?.omiCount) return
    data = {...data,...stats}
    await formatPlayer(data)
    if(!data?.gp) return
    playerCache.set(collection, data.playerId, JSON.stringify(data))
    if(cachGuildId) guildIdCache.set(data?.playerId, +data?.allyCode, data?.guildId)
    if(opt.projection) return dataProject(data, opt.projection)
    return data
  }catch(e){
    log.error(e)
  }
}
