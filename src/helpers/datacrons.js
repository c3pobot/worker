'use strict'
const mongo = require('mongoclient')
const getDataCron = async(cron = {}, cronDef = {}, res = {})=>{
  if(!cron?.affix || cron.affix?.length < 9) return
  if(!cron.affix[8]) return
  if(!cronDef[cron.templateId]) cronDef[cron.templateId] = (await mongo.find('datacronList', { _id: cron.templateId }, { id: 1, setId: 1, ability: 1, nameKey: 1 }))[0]
  if(!cronDef[cron.templateId]?.setId) return

  let unit = cronDef[cron.templateId]?.ability[cron.affix[8].abilityId]?.target[cron.affix[8].targetRule]?.unit
  if(!unit.baseId) return
  if(!res[cron.setId]) res[cron.setId] = { id: cron.setId, nameKey: cronDef[cron.templateId].nameKey, units: {} }
  if(!res[cron.setId].units[unit.baseId]) res[cron.setId].units[unit.baseId] = { id: unit.baseId, nameKey: unit.nameKey, count: 0 }
  res[cron.setId].units[unit.baseId].count++
}
const getUnitDataCrons = async(players = [], cronDef = {})=>{
  let res = {}
  for(let x in players){
    if(!players[x]?.datacron || players[x]?.datacron?.length === 0) continue
    for(let i in players[x].datacron) await getDataCron(players[x].datacron[i], cronDef, res)
  }
  return res
}
const getCronCounts = (home = {}, away = {})=>{
  let res = {}
  for(let i in home){
    if(!res[i]) res[i] = { id: i, nameKey: home[i].nameKey, units: {} }
    for(let u in home[i].units){
      res[i].units[u] = { id: u, nameKey: home[i]?.units[u]?.nameKey, home: (home[i]?.units[u]?.count || 0), away: (away[i]?.units[u]?.count || 0) }
    }
  }
  for(let i in away){
    if(!res[i]) res[i] = { id: i, nameKey: away[i].nameKey, units: {} }
    for(let u in away[i].units){
      if(!home[i]?.units[u]?.nameKey) res[i].units[u] = { id: u, nameKey: away[i].units[u].nameKey, home: 0, away: (away[i].units[u].count || 0) }
    }
  }
  return Object.values(res)
}
module.exports = {
  getUnitDataCrons: getUnitDataCrons,
  getCronCounts: getCronCounts
}
