'use strict'
const mongo = require('mongoclient')
const minio = require('src/minio')
const fetch = require('node-fetch')

const fetchHistory = async(playerId, mode)=>{
  let fileName = `5v5/${playerId}.json`, bucket = 'ga-history'
  if(mode === '3v3'){
    bucket = 'ga-history-season-61'
    fileName = `${playerId}-61-1-14-2025.json`
  }
  return await minio.get(bucket, fileName)
  /*
  if(!GA_HIST_OBJECT_STORAGE_ENDPOINT) return
  let res = await fetch(`${GA_HIST_OBJECT_STORAGE_ENDPOINT}:ga-history/${mode}/${playerId}.json`, { timeout: 30000, compress: true, method: 'GET' })
  if(res?.headers?.get('Content-Type')?.includes('application/json') || res?.headers?.get('Content-Type')?.includes('binary/octet-stream')) return await res.json()
  */
}

module.exports = async(playerId, mode)=>{
  if(!playerId || !mode) return
  let res = (await mongo.find(`gaHistoryCache-${mode}`, { _id: playerId}))[0]
  if(res) return res
  let newHistory = await fetchHistory(playerId, mode)
  if(newHistory?.matchResult){
    res = {
      date: newHistory.date,
      mode: newHistory.mode,
      season: newHistory.season,
      league: newHistory.league,
      eventInstanceId: newHistory.eventInstanceId,
      matchResult: newHistory?.matchResult?.map(x=>{
        return {
          matchId: x.matchId,
          home: x.home,
          away: x.away,
          attackResult: x.attackResult.reduce((acc, current)=> acc.concat(current.duelResult), []),
          defenseResult: x.defenseResult.reduce((acc, current)=> acc.concat(current.duelResult), [])
        }
      })
    }
    await mongo.set(`gaHistoryCache-${mode}`, { _id: playerId }, res)
    return res
  }
}
