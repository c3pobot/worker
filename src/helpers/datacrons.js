'use strict'
const mongo = require('mongoclient')
const getDataCron = async(cron = {}, playerId, cronDef = {}, res = {})=>{
  if(!playerId) return
  if(!cron?.affix || cron.affix?.length < 9) return
  if(!cronDef[cron.templateId]) cronDef[cron.templateId] = (await mongo.find('datacronList', { _id: cron.templateId }, { id: 1, setId: 1, ability: 1, nameKey: 1, tier: 1, expirationTimeMs: 1 }))[0]
  if(!cronDef[cron.templateId]?.setId) return

  let unitIndex = cronDef[cron.templateId]?.tier?.length - 1
  if(!cron.affix[unitIndex]) return

  let unit = cronDef[cron.templateId]?.ability[cron.affix[unitIndex]?.abilityId]?.target[cron.affix[unitIndex].targetRule]?.unit
  if(!unit?.baseId) return
  if(!res[cron.setId]) res[cron.setId] = { id: cron.setId, nameKey: cronDef[cron.templateId].nameKey, units: {}, expires: cronDef[cron.templateId].expirationTimeMs }
  if(!res[cron.setId].units[unit.baseId]) res[cron.setId].units[unit.baseId] = { id: unit.baseId, nameKey: unit.nameKey, players: {} }
  res[cron.setId].units[unit.baseId].players[playerId] = playerId
}
const getUnitDataCrons = async(players = [], cronDef = {})=>{
  let res = {}
  for(let x in players){
    if(!players[x]?.datacron || players[x]?.datacron?.length === 0) continue
    for(let i in players[x].datacron) await getDataCron(players[x].datacron[i], players[x].playerId, cronDef, res)
  }
  return res
}
const getCronCounts = (home = {}, away = {})=>{
  let res = {}, timeNow = Date.now()
  for(let i in home){
    if(home[i].expires < timeNow) continue

    if(!res[i]) res[i] = { id: i, nameKey: home[i].nameKey, units: {} }
    for(let u in home[i].units){
      let homeCount = +(Object.values(home[i]?.units[u]?.players || {})?.length || 0), awayCount = +(Object.values(away[i]?.units[u]?.players || {})?.length || 0)
      res[i].units[u] = { id: u, nameKey: home[i]?.units[u]?.nameKey, home: homeCount, away: awayCount }
    }
  }
  for(let i in away){
    if(away[i].expires < timeNow) continue
    if(!res[i]) res[i] = { id: i, nameKey: away[i].nameKey, units: {} }
    for(let u in away[i].units){

      if(!home[i]?.units[u]?.nameKey) res[i].units[u] = { id: u, nameKey: away[i].units[u].nameKey, home: 0, away: +(Object.values(away[i]?.units[u]?.players || {})?.length || 0) }
    }
  }
  return Object.values(res)
}
module.exports = {
  getUnitDataCrons: getUnitDataCrons,
  getCronCounts: getCronCounts
}
