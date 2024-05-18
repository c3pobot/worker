'use strict'
const fetch = require('node-fetch')
const GA_HIST_OBJECT_STORAGE_ENDPOINT = process.env.GA_HIST_OBJECT_STORAGE_ENDPOINT

const fetchHistory = async(playerId, key, season)=>{
  if(!GA_HIST_OBJECT_STORAGE_ENDPOINT) return
  let res = await fetch(`${GA_HIST_OBJECT_STORAGE_ENDPOINT}:ga-history-season-${season}/${playerId}-${key}.json`, { timeout: 30000, compress: true, method: 'GET' })
  if(res?.headers?.get('Content-Type')?.includes('application/json')) return await res.json()
}
module.exports = async(playerId, key, season)=>{
  if(!playerId || !key || !season) return
  let res = await fetchHistory(playerId, key, season)
  if(res) return {
    date: res.date,
    mode: res.mode,
    matchResult: res.matchResult.map(x=>{
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
