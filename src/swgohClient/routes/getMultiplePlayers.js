'use strict'
const queryPlayer = require('./queryPlayer')
const getPlayer = require('./getPlayer')
const getPlayer = async(opts = {}, collection = 'playerCache', calcStats = true)=>{
  try{
    if(opts.project) opts.project.playerId = 1
    let res = (await mongo.find(collection, opts.query, opts.project))[0]
    if(res?.playerId) return res
    if(calcStats) return await getPlayer({ collection: collection, playerId: opts.playerId, allyCode: opts.allyCode })
    return await queryPlayer({ playerId: opts.playerId, allyCode: opts.allyCode })
  }catch(e){
    throw(e)
  }
}
module.exports = async(opts = {})=>{
  try{
    let players = [], collection = opts.collection || 'playerCache', idType = 'playerId'
    if(opts.players[0].allyCode) idType = 'allyCode'
    let i = opts.players?.length
    while(i--){
      let query = { _id: players[i].playerId }
      if(idType === 'allyCode') query = { allyCode: +players[i].allyCode }
      players.push(getPlayer({ query: query, playerId: players[i].playerId, allyCode: players[i].allyCode, project: opts.project }, collection, opts.calcStats))
    }
    if(opts.guildId) players = await getCacheGuildPlayers(opts.guildId, opts.collection, project)
    if(players?.length === opts.players?.length) return players

    let foundIds = players.map(x=>x[idType])
    let missingPlayers = opts.players.filter(x=>!foundIds.includes(x[idType]))
    let missing = await getNewPlayers(missingPlayers, idType, opts.collection, project, opts.stats)
  }catch(e){
    throw(e)
  }
}
