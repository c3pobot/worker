'use strict'
const log = require('logger')
const queryPlayer = require('./queryPlayer');
const formatPlayer = require('src/format/formatPlayer');
const calcRosterStats = require('src/helpers/calcRosterStats');
const playerCache = require('src/helpers/cache/player');
const dataProject = require('src/helpers/cache/project');

module.exports = async(payload = {}, opt = {})=>{
  let collection = opt.collection || 'playerCache'
  let data = await queryPlayer(payload)
  if(!data?.rosterUnit || data.rosterUnit.length === 0) return
  let stats = calcRosterStats(data.rosterUnit, data?.allyCode)
  if(!stats?.omiCount) return
  data = {...data,...stats}
  await formatPlayer(data)
  if(!data?.gp) return
  playerCache.set(collection, data.playerId, JSON.stringify(data))
  if(opt.projection) return dataProject(data, opt.projection)
  return data
}
