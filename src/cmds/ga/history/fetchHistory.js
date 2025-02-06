'use strict'
const fetch = require('node-fetch')
const GA_HIST_OBJECT_STORAGE_ENDPOINT = process.env.GA_HIST_OBJECT_STORAGE_ENDPOINT

const fetchHistory = async(playerId, mode)=>{
  if(!GA_HIST_OBJECT_STORAGE_ENDPOINT) return
  let res = await fetch(`${GA_HIST_OBJECT_STORAGE_ENDPOINT}:ga-history/${mode}/${playerId}.json`, { timeout: 30000, compress: true, method: 'GET' })
  if(res?.headers?.get('Content-Type')?.includes('application/json') || res?.headers?.get('Content-Type')?.includes('binary/octet-stream')) return await res.json()
}
module.exports = async(playerId, mode)=>{
  if(!playerId || !mode) return
  let res = await fetchHistory(playerId, mode)
  if(res?.matchResult) return {
    date: res.date,
    mode: res.mode,
    season: res.season,
    league: res.league,
    eventInstanceId: res.eventInstanceId,
    matchResult: res?.matchResult?.map(x=>{
      return {
        matchId: x.matchId,
        home: x.home,
        away: x.away,
        attackResult: x.attackResult.reduce((acc, current)=> acc.concat(current.duelResult), []),
        defenseResult: x.defenseResult.reduce((acc, current)=> acc.concat(current.duelResult), [])
      }
    })
  }
}
