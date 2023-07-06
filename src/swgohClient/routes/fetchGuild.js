'use strict'
const { mongo } = require('helpers/mongo')
const fetchPlayer = require('./fetchPlayer')
const getGuild = require('./getGuild')
const getGuildId =  require('./getGuildId')
const { each, eachLimit } = require('async')
const MAX_SYNC = +process.env.MAX_CLIENT_SYNC || 100
const playerCollectionEnum = {guildCache: 'playerCache', twGuildCache: 'twPlayerCache'}
const updatedDataCounts = async(p = {}, data = {})=>{
  try{
    for(let i in p.relic){
      if(!data.relic[i]) data.relic[i] = 0
      data.relic[i] += p.relic[i]
    }
    for(let i in p.omi){
      if(!data.omi[i]) data.omi[i] = 0
      data.omi[i] += p.omi[i]
    }
    for(let i in p.mod){
      if(!data.mod[i]) data.mod[i] = 0
      data.mod[i] += p.mod[i]
    }
    for(let i in p.gl){
      if(!data.gl[i]) data.gl[i] = 0
      data.gl[i] += p.gl[i]
    }
    data.dataCron.total = p.dataCron.total
    for(let i in p.dataCron){
      if(i === 'total') continue
      if(!data.dataCron[i]) data.dataCron[i] = {}
      for(let s in p.dataCron[i]){
        if(!data.dataCron[i][s]) data.dataCron[i][s] = 0
        data.dataCron[i][s] += p.dataCron[i][s]
      }
    }
  }catch(e){
    throw(e)
  }
}

const getPlayers = async(members = [], dataCount = {}, collection = 'playerCache', project)=>{
  try{
    console.log(members?.length)
    let res = []
    const getPlayer = async(player = {})=>{
      try{
        let p = await fetchPlayer({playerId: player?.playerId, allyCode: player?.allyCode, collection: collection, project: project}, )
        if(p?.summary){
          p.memberContribution = player.memberContribution
          //delete p.rosterUnit
          dataCount.gp += p.gp
          dataCount.gpChar += p.gpChar
          dataCount.gpShip += p.gpShip
          dataCount.zeta += p.summary.zeta
          updatedDataCounts(p.summary, dataCount)
          res.push(p)
        }
      }catch(e){
        throw(e)
      }
    }
    await eachLimit(members, MAX_SYNC, async(p)=>{
      await getPlayer(p)
    })

    console.log(res.length)
    if(res.length === members.length) return res
  }catch(e){
    throw(e)
  }
}
const getCachePlayers = async(guildId, members = [], dataCount, collection = 'playerCache', project)=>{
  try{
    let res = await mongo.find(collection, {guildId: guildId}, project)
    if(!res) res = []
    console.log('found '+res.length)
    if(res?.length === members.length) return res
    let foundMemberIds = res.map(x=>x.playerId)
    let missingMembers = members.filter(x=>!foundMemberIds.includes(x.playerId))
    let missing = await getPlayers(missingMembers, dataCount, collection, project)
    if(missing?.length > 0) res = res.concat(missing)
    if(res.length === members.length) return res
  }catch(e){
    throw(e)
  }
}
module.exports = async(opts = {})=>{
  try{
    let collection = opts.collection || 'guildCache', playerCollection = playerCollectionEnum[opts.collection] || 'playerCache'
    let timeStart = Date.now()
    let dataCount = { relic: { total: 0 }, omi: { total: 0 },  mod: { r6: 0, 10: 0, 15: 0, 20: 0, 25: 0 }, gear: {}, rarity: { }, dataCron: { total: 0 }, gl: {}, zeta: 0, gp: 0, gpChar: 0, gpShip: 0 }
    let guildId = await getGuildId(opts)
    if(!guildId) return
    let guildIdTime = Date.now()
    console.log('time to get guildId '+(guildIdTime - timeStart) / 1000)

    let guild = await getGuild({ guildId: guildId, collection: collection, project: opts.guildProject })
    let getGuildTime = Date.now()
    console.log('time to query guild '+(getGuildTime - guildIdTime) / 1000)
    if(!guild || !guild?.member ) return
    guild.member = guild.member.filter(x=>x.memberLevel !== 1)
    if(opts.excludePlayers && guild.summary) return guild
    let players = await getCachePlayers(guildId, guild.member, dataCount, playerCollection, opts.playerProject)
    let playerTime = Date.now()
    console.log('time to getPlayers '+(playerTime - getGuildTime)/1000)
    console.log('time for all '+(playerTime - timeStart) / 1000)
    if(!players) return
    mongo.set(collection, {_id: guildId}, { summary: dataCount })
    if(!opts.excludePlayers) guild.member = players
    return guild
  }catch(e){
    console.error(e);
  }
}
